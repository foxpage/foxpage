import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/system/register';
import Logo from '@/components/common/Logo';

const Container = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const FormContainer = styled.div`
  width: 300px;
  margin: 0 auto;
  background: rgb(255, 255, 255);
  padding: 18px;
  border: 1px solid rgb(217, 217, 217);
  border-radius: 4px;
`;

const mapStateToProps = (store: RootState) => ({
  loading: store.system.register.loading,
});

const mapDispatchToProps = {
  register: ACTIONS.register,
};

type RegisterType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Register: React.FC<RegisterType> = (props) => {
  const { loading, register } = props;
  const [, forceUpdate] = useState({});

  const history = useHistory();

  const [form] = Form.useForm();

  useEffect(() => {
    forceUpdate({});
  }, []);

  const onFinish = (values) => {
    register({
      ...values,
      onSuccess: () => {
        message.success('Register succeed, please login!');
        history.push('/login');
      },
    });
  };

  return (
    <Container>
      <Spin spinning={loading}>
        <FormContainer>
          <Form
            name="normal_login"
            className="login-form"
            form={form}
            initialValues={{ remember: true }}
            onFinish={onFinish}>
            <Logo />
            <Form.Item
              name="account"
              rules={[
                { required: true, message: 'Please input your account!' },
                { pattern: new RegExp('^[0-9a-zA-Z-_/@.]+$'), message: 'Please input valid account!' },
              ]}>
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Account" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                {
                  pattern: new RegExp('^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$'),
                  message: 'Please input valid email!',
                },
              ]}>
              <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                style={{ width: '100%' }}>
                Register
              </Button>
              <Link to="/login">login now!</Link>
            </Form.Item>
          </Form>
        </FormContainer>
      </Spin>
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
