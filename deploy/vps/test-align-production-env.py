import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

folder = Path(__file__).parent
spec = importlib.util.spec_from_file_location("align_env", folder / "align-production-env.py")
align_env = importlib.util.module_from_spec(spec)
spec.loader.exec_module(align_env)


class AlignProductionEnvTest(unittest.TestCase):
    def test_matches_every_generator_default(self):
        defaults = json.loads((folder / "settings.json").read_text())["envDefaults"]
        for key, expected in defaults.items():
            self.assertEqual(align_env.EXPECTED[key], expected, key)

    def test_preserves_credentials_and_backup_then_is_idempotent(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / ".env"
            original = (
                'APP_KEY="base64:keep-this"\nDB_PASSWORD="keep # this $ value"\n'
                'STRIPE_SECRET=keep-stripe\nMAIL_PASSWORD=keep-mail\n'
                'MODERATION_API_TOKEN=keep-moderation\nREVERB_APP_SECRET=keep-reverb\n'
                'REVERB_APP_KEY=public-reverb-key\nVAPID_PRIVATE_KEY=keep-vapid\n'
                'REDIS_PASSWORD=keep-redis\nSUPPORT_EMAIL=old@example.com\n'
                'SUPPORT_EMAIL=duplicate@example.com\nVITE_REVERB_APP_KEY=old-public\n'
                'CUSTOM_SETTING="${APP_NAME}"\n'
            ).encode()
            target.write_bytes(original)
            backup = align_env.align(target)
            self.assertEqual(backup.read_bytes(), original)
            result = target.read_text()
            for line in original.decode().splitlines():
                key = line.partition("=")[0]
                if key not in align_env.EXPECTED and key != "VITE_REVERB_APP_KEY":
                    self.assertIn(line + "\n", result)
            self.assertEqual(result.count("SUPPORT_EMAIL="), 1)
            self.assertIn("SUPPORT_EMAIL=contact@lesbi-libre.fr\n", result)
            self.assertIn("VITE_REVERB_APP_KEY=public-reverb-key\n", result)
            self.assertIn("BROADCAST_CONNECTION=reverb\n", result)
            self.assertIsNone(align_env.align(target))

    def test_missing_public_key_leaves_file_untouched(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / ".env"
            target.write_text("APP_KEY=keep\nREVERB_APP_KEY=\n")
            original = target.read_bytes()
            with self.assertRaises(ValueError):
                align_env.align(target)
            self.assertEqual(target.read_bytes(), original)
            self.assertEqual(list(target.parent.iterdir()), [target])

    def test_preserves_enabled_indexing_and_defaults_new_sites_to_preview(self):
        for value in ('true', 'false', None):
            with self.subTest(indexing=value), tempfile.TemporaryDirectory() as directory:
                target = Path(directory) / '.env'
                target.write_text('REVERB_APP_KEY=public-key\n' +
                                  (f'SEO_INDEXING_ENABLED={value}\n' if value else ''))
                align_env.align(target)
                self.assertIn(f'SEO_INDEXING_ENABLED={value or "false"}\n', target.read_text())


if __name__ == "__main__":
    unittest.main()
