import React, { useEffect, useMemo, useState } from 'react';

import {
  EyeInvisibleOutlined,
  EyeOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import MonacoEditor, { OnMount, OnValidate } from '@monaco-editor/react';
import { Button } from 'antd';
import stringify from 'json-stable-stringify';
import MarkdownIt from 'markdown-it';
import prettier from 'prettier';
import babelParser from 'prettier/parser-babel';
import htmlParser from 'prettier/parser-html';
import mdParser from 'prettier/parser-markdown';
import postcssParser from 'prettier/parser-postcss';

import { ControlPanel, MarkdownDisplay, MarkdownEditorWrapper, Wrapper } from './styles/Markdown';

import './styles/editor.css';

interface CodeEditorProps {
  language: string;
  value: string;
  onMount?: OnMount;
  onChange?(value: string): void;
  onError?: OnValidate;
  readOnly?: boolean;
  height?: number | string;
  style?: React.CSSProperties;
}

const languageParserMap = {
  javascript: {
    parser: 'babel',
    plugin: babelParser,
  },
  markdown: {
    parser: 'markdown',
    plugin: mdParser,
  },
  json: {
    parser: 'json',
    plugin: babelParser,
  },
  html: {
    parser: 'html',
    plugin: htmlParser,
  },
  css: {
    parser: 'css',
    plugin: postcssParser,
  },
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  onChange,
  onMount,
  onError,
  value,
  language,
  readOnly = false,
  height = 500,
  style,
}) => {
  const [editor, setEditor] = useState<any>(null);
  const [valueChanged, setValueChanged] = useState(false);
  const handleEditorChange = (value) => {
    if (!readOnly) {
      if (!valueChanged) setValueChanged(true);
      onChange?.(value);
    }
  };
  const onEditorDidMount: OnMount = (monacoEditor, monaco) => {
    setEditor(monacoEditor);
    monacoEditor.getModel()?.updateOptions({ tabSize: 2 });
    monacoEditor.setValue(value);
    onMount?.(monacoEditor, monaco);
  };

  useEffect(() => {
    if (!valueChanged && editor) {
      editor.setValue(value);
    }
  }, [valueChanged, value, editor]);

  const onValidate: OnValidate = (markers) => {
    onError?.(markers);
  };

  const onFormatClick = () => {
    // get current value from editor
    const unformatted = editor.getModel().getValue();

    // format that value
    const formatted = prettier
      .format(unformatted, {
        parser: languageParserMap[language].parser,
        plugins: [languageParserMap[language].plugin],
        useTabs: false,
        semi: true,
        singleQuote: true,
        printWidth: language === 'json' ? 20 : 40,
      })
      .replace(/\n$/, '');

    // set the formatted value back in the editor
    editor.setValue(formatted);
  };

  return (
    <div className="editor-wrapper" style={style}>
      {!readOnly && (
        <button className="button-format" onClick={onFormatClick}>
          Format
        </button>
      )}
      <MonacoEditor
        onMount={onEditorDidMount}
        onChange={handleEditorChange}
        onValidate={onValidate}
        theme="light"
        // value has to be set in readonly mode, it's a bug in component
        value={''}
        // defaultValue={value}
        language={language}
        height={height}
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
        }}
      />
    </div>
  );
};

interface JSONCodeEditorProps extends Omit<CodeEditorProps, 'value' | 'onChange' | 'language'> {
  value: Record<string, any>;
  onChange?: (value: Record<string, any>) => void;
}

export const JSONCodeEditor = ({ value, onChange, ...rest }: JSONCodeEditorProps) => {
  const parsedValue = useMemo(() => {
    return stringify(value, { space: 2 });
  }, [value]);
  const handleChange = (v: string) => {
    try {
      const parsed = JSON.parse(v);
      onChange?.(parsed);
    } catch (_) {}
  };

  return <CodeEditor value={parsedValue} language="json" onChange={handleChange} {...rest} />;
};

interface MarkdownCodeEditorProps extends Omit<CodeEditorProps, 'language'> {}

const mdItParser = new MarkdownIt();

export const MarkdownCodeEditor = ({ value, ...rest }: MarkdownCodeEditorProps) => {
  const parsedHtml = mdItParser.render(value);
  const [fullscreen, setFull] = useState(false);
  const [preview, setPreview] = useState(false);

  return (
    <Wrapper fullscreen={fullscreen}>
      <ControlPanel>
        <Button
          icon={preview ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          size="small"
          onClick={() => setPreview((prev) => !prev)}
        />
        <Button
          icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={() => setFull((prev) => !prev)}
          size="small"
        />
      </ControlPanel>

      <MarkdownEditorWrapper>
        <CodeEditor
          value={value}
          style={{ width: preview ? '50%' : '100%' }}
          language="markdown"
          {...rest}
          height={fullscreen ? '100vh' : 500}
        />
        {preview && <MarkdownDisplay dangerouslySetInnerHTML={{ __html: parsedHtml }} />}
      </MarkdownEditorWrapper>
    </Wrapper>
  );
};
