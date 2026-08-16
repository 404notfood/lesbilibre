import type { JSX as ReactJSX } from 'react';

/**
 * React 19 (@types/react v19) removed the global `JSX` namespace in favour of
 * `React.JSX`. The codebase still annotates component return types as
 * `JSX.Element`, so the global namespace is re-declared here as an alias.
 */
declare global {
    namespace JSX {
        type ElementType = ReactJSX.ElementType;
        type Element = ReactJSX.Element;
        type ElementClass = ReactJSX.ElementClass;
        type ElementAttributesProperty = ReactJSX.ElementAttributesProperty;
        type ElementChildrenAttribute = ReactJSX.ElementChildrenAttribute;
        type IntrinsicAttributes = ReactJSX.IntrinsicAttributes;
        type IntrinsicClassAttributes<T> = ReactJSX.IntrinsicClassAttributes<T>;
        type IntrinsicElements = ReactJSX.IntrinsicElements;
    }
}
