import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';

import { CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Spin, Tabs, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/data/list';
import { FoxPageBreadcrumb, FoxPageContent, JSONCodeEditor } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { DataBaseQueryParams } from '@/types/index';

const { TextArea } = Input;

const QUERY_TYPE = 'find';
const TABS = ['Find', 'Count', 'Distinct', 'Aggregate', 'Index'];

const SpinWrapper = styled.div`
  height: 100%;
  div.foxpage-loading {
    height: 100%;
    .ant-spin-container {
      height: 100%;
    }
  }
`;
const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;
const Wrapper = styled.div`
  width: 49.5%;
  height: 100%;
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
`;
const FormContainer = styled.div`
  padding: 0 12px;
`;

const mapStateToProps = (store: RootState) => ({
  loading: store.data.list.loading,
  result: store.data.list.result,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  queryDataBase: ACTIONS.queryDataBase,
};

type PageListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PageListType> = (props) => {
  const { loading, result, clearAll, queryDataBase } = props;
  const [collectionData, setCollectionData] = useState(result || []);
  const [queryType, setQueryType] = useState(QUERY_TYPE);

  // url params
  const routeMatchParams: any = useRouteMatch()?.params;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { data } = locale.business;

  // form
  const [form] = Form.useForm();

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    setCollectionData(result);
  }, [result]);

  const handleTransformFormToParams = (values: any, type: string) => {
    let params: DataBaseQueryParams = {
      collect: routeMatchParams?.collect || '',
      type,
    };

    if (type === 'find') {
      params = {
        ...params,
        sort: values.sort,
        projection: values.projection,
        skip: values.skip,
        limit: values.limit,
      };
    }
    if (type === 'distinct') {
      params = {
        ...params,
        field: values.key,
      };
    }
    if (type === 'aggregate') {
      params = {
        ...params,
        pipeline: values.pipeline,
      };
    }
    if (type === 'find' || type === 'count' || type === 'distinct' || type === 'explain') {
      params = {
        ...params,
        filter: values.filter,
      };
    }

    return params;
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const params = handleTransformFormToParams(values, queryType);

        if (params) queryDataBase(params);
      })
      .catch((info) => {
        console.warn('Validate Failed:', info);
      });
  };

  const handleExplain = () => {
    form
      .validateFields()
      .then((values) => {
        const params = {
          collect: routeMatchParams?.collect || '',
          type: 'explain',
          filter: values.filter,
        };

        if (params) queryDataBase(params);
      })
      .catch((info) => {
        console.warn('Validate Failed:', info);
      });
  };

  const formStructure = useMemo(
    () => (
      <Form form={form} name={queryType} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} autoComplete="off">
        <Form.Item label={queryType} name={queryType}>
          <Tag color="green">{routeMatchParams?.collect}</Tag>
        </Form.Item>
        {queryType === 'find' && (
          <>
            <Form.Item label="filter" name="filter">
              <TextArea />
            </Form.Item>
            <Form.Item label="projection" name="projection">
              <TextArea />
            </Form.Item>
            <Form.Item label="sort" name="sort">
              <TextArea />
            </Form.Item>
            <Form.Item label="skip" name="skip">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="limit" name="limit" rules={[{ required: true, message: data.limitEmptyTips }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}
        {queryType === 'count' && (
          <Form.Item label="query" name="filter">
            <TextArea />
          </Form.Item>
        )}
        {queryType === 'distinct' && (
          <>
            <Form.Item label="key" name="key">
              <Input />
            </Form.Item>
            <Form.Item label="query" name="filter" rules={[{ required: true, message: data.queryEmptyTips }]}>
              <TextArea />
            </Form.Item>
          </>
        )}
        {queryType === 'aggregate' && (
          <Form.Item
            label="pipeline"
            name="pipeline"
            rules={[{ required: true, message: data.pipelineEmptyTips }]}>
            <TextArea />
          </Form.Item>
        )}
        <Form.Item wrapperCol={{ offset: 4, span: 20 }}>
          <Button type="primary" icon={<CheckOutlined />} onClick={handleSubmit}>
            {data.run}
          </Button>
          {queryType === 'find' && (
            <Button icon={<EyeOutlined />} onClick={handleExplain} style={{ marginLeft: 8 }}>
              {data.explain}
            </Button>
          )}
        </Form.Item>
      </Form>
    ),
    [form, queryType, handleSubmit],
  );

  return (
    <React.Fragment>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb breadCrumb={[{ name: `${data.collection} - ${routeMatchParams?.collect}` }]} />
        }>
        <SpinWrapper>
          <Spin wrapperClassName="foxpage-loading" spinning={loading}>
            <Container>
              <Wrapper>
                <Tabs
                  type="card"
                  defaultActiveKey={QUERY_TYPE}
                  items={TABS.map((item) => ({
                    label: item,
                    key: item.toLowerCase(),
                  }))}
                  onChange={setQueryType}
                />
                <FormContainer>{formStructure}</FormContainer>
              </Wrapper>
              <Wrapper>
                <Tabs defaultActiveKey="json" type="card">
                  <Tabs.TabPane tab="JSON" key="json" />
                </Tabs>
                <JSONCodeEditor readOnly height={700} value={collectionData} />
              </Wrapper>
            </Container>
          </Spin>
        </SpinWrapper>
      </FoxPageContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
