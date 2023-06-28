import React, { ReactNode } from 'react';

interface WithErrorCatchProps {
  editor: ReactNode;
  tips: string;
}

interface WithErrorCatchState {
  withError: boolean;
}

class WithErrorCatch extends React.Component<WithErrorCatchProps, WithErrorCatchState> {
  static defaultProps = {
    editor: {},
  };
  constructor(props) {
    super(props);
    this.state = {
      withError: false,
    };
  }

  componentDidCatch() {
    this.setState({
      withError: true,
    });
  }

  render() {
    const { editor, tips } = this.props;
    if (this.state.withError) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: 10,
            fontSize: '14px',
            border: '1px solid #ff9898',
            color: '#ff4141',
            background: '#ffdada',
          }}>
          {tips}
        </div>
      );
    }

    return editor;
  }
}

export default WithErrorCatch;
