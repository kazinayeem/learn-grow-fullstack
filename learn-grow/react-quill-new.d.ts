declare module 'react-quill-new' {
  import React from 'react';
  
  export interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    theme?: string;
    modules?: any;
    formats?: string[];
    bounds?: string | HTMLElement;
    onChange?: (content: string, delta: any, source: any, editor: any) => void;
    onChangeSelection?: (selection: any, source: any, editor: any) => void;
    onFocus?: (selection: any, source: any, editor: any) => void;
    onBlur?: (previousSelection: any, source: any, editor: any) => void;
    onKeyPress?: React.EventHandler<any>;
    onKeyDown?: React.EventHandler<any>;
    onKeyUp?: React.EventHandler<any>;
    readOnly?: boolean;
    style?: React.CSSProperties;
    className?: string;
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}

declare module 'react-quill-new/dist/quill.snow.css';
