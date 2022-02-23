import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row as AntdRow, Select, Spin, Typography } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/settings';
import { ResourceTypeArray } from '@/constants/resource';
import { FoxpageBreadcrumb } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import { ApplicationEditType, RegionType } from '@/types/application';
import { ContentUrlParams } from '@/types/application/content';

const { Option } = Select;

const Title = styled(Typography.Title)`
  margin-bottom: 0 !important;
  margin-top: 12px;
`;

const Label = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-right: 12px;
  height: 100%;
  align-items: center;
`;

const Row = styled(AntdRow)`
  margin-bottom: 12px;
`;

const ResourceLabel = styled.div`
  margin-right: 12px;
  width: 100px;
  display: inline-block;
  margin-bottom: 12px;
`;

const iconStyle = {
  margin: '8px 0 0 8px',
  cursor: 'pointer',
};

const cloneApplication = application => {
  return Object.assign({}, application);
};

const mapStateToProps = (store: RootState) => ({
  loading: store.group.application.settings.loading,
  application: store.group.application.settings.application,
  locales: store.group.application.settings.locales,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchApplicationInfo: ACTIONS.fetchApplicationInfo,
  fetchAllLocales: ACTIONS.fetchAllLocales,
  saveApplication: ACTIONS.saveApplication,
};

type SettingType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<SettingType> = props => {
  const { applicationId, organizationId } = useParams<ContentUrlParams>();
  const { locale } = useContext(GlobalContext);
  const { global, setting, resource: resourceI18n, application: applicationI18n } = locale.business;
  const {
    loading,
    application,
    locales = [],
    fetchApplicationInfo,
    clearAll,
    fetchAllLocales,
    saveApplication,
  } = props;
  const [region, setRegion] = useState<Array<RegionType>>([]);
  const [editApplication, setEditApplication] = useState<ApplicationEditType | undefined>();

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationInfo(applicationId);
      fetchAllLocales(applicationId);
    }
  }, [applicationId]);

  useEffect(() => {
    if (application) {
      const { locales = [], resources = [] } = application;
      setEditApplication({
        ...application,
        resources: resources.length > 0 ? resources : [],
        localeObjects:
          locales.length > 0
            ? locales.map((locale: string) => {
                const array = locale.split('-');
                return {
                  region: array[1],
                  language: array[0],
                };
              })
            : [],
      } as ApplicationEditType);
    }
  }, [application]);

  useEffect(() => {
    const newRegion: RegionType[] = [];
    locales.forEach((locale: string) => {
      if (locale) {
        const array = locale.split('-');
        if (array.length === 2) {
          const exist = newRegion.find(item => item.name === array[1]);
          if (exist) {
            exist.languages.push(array[0]);
          } else {
            newRegion.push({ name: array[1], languages: [array[0]] });
          }
        }
      }
    });
    setRegion(newRegion);
  }, [locales]);

  const handleAddLocale = useCallback(
    (index: number) => {
      const newEditApplication = cloneApplication(editApplication);
      newEditApplication?.localeObjects.splice(index, 0, { region: '', language: '' });
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleRemoveLocale = useCallback(
    (index: number) => {
      const newEditApplication = cloneApplication(editApplication);
      newEditApplication?.localeObjects.splice(index, 1);
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleUpdate = useCallback(
    (key: string, value: unknown) => {
      const newEditApplication = cloneApplication(editApplication);
      newEditApplication[key] = value;
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleUpdateLocale = useCallback(
    (index: number, localeObj) => {
      const newEditApplication = cloneApplication(editApplication);
      newEditApplication?.localeObjects.splice(index, 1, localeObj);
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleAddResource = useCallback(
    (index: number) => {
      const newEditApplication = _.cloneDeep(editApplication);
      newEditApplication?.resources.splice(index, 0, {
        id: '',
        name: '',
        type: ResourceTypeArray[0].type,
        detail: { host: '', downloadHost: '' },
      });
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleRemoveResource = useCallback(
    (index: number) => {
      const newEditApplication = _.cloneDeep(editApplication);
      newEditApplication?.resources.splice(index, 1);
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleUpdateResource = useCallback(
    (index: number, key: string, value: unknown) => {
      const newEditApplication = _.cloneDeep(editApplication);
      if (newEditApplication) {
        newEditApplication.resources[index][key] = value;
        setEditApplication(newEditApplication);
      }
    },
    [editApplication],
  );

  const handleSave = useCallback(() => {
    if (editApplication) {
      saveApplication(editApplication);
    }
  }, [editApplication]);

  return (
    <React.Fragment>
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: applicationI18n.applicationList, link: `/#/organization/${organizationId}/application/list` },
          { name: global.setting },
        ]}
      />
      <Spin tip="Loading" spinning={loading}>
        <div style={{ marginTop: 12 }}>
          <Row>
            <Col span={6}>
              <Title level={3} type="secondary" style={{ textAlign: 'right' }}>
                {setting.basicInfo}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Label>{global.nameLabel}</Label>
            </Col>
            <Col span={10}>
              <Input
                value={editApplication?.name}
                onChange={e => {
                  handleUpdate('name', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Label>{setting.Introduction}</Label>
            </Col>
            <Col span={10}>
              <Input
                value={editApplication?.intro}
                onChange={e => {
                  handleUpdate('intro', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={3} type="secondary" style={{ textAlign: 'right' }}>
                {setting.accessControl}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Label>{global.host}</Label>
            </Col>

            <Col span={10}>
              <Input
                value={editApplication?.host?.length ? editApplication?.host[0] : ''}
                onChange={e => {
                  handleUpdate('host', [e.target.value]);
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Label>{setting.slug}</Label>
            </Col>
            <Col span={10}>
              <Input
                value={editApplication?.slug}
                onChange={e => {
                  handleUpdate('slug', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={3} type="secondary" style={{ textAlign: 'right' }}>
                {global.locale}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={18} offset={6}>
              {editApplication?.localeObjects?.map((locale, index) => {
                const languages = region.find(item => item.name === locale.region)?.languages;
                return (
                  <Row key={`${locale.region}${locale.language}`}>
                    <Col span={24}>
                      <span style={{ marginRight: 12 }}>{setting.region}</span>
                      <Select
                        value={locale.region}
                        style={{ width: 120 }}
                        onChange={val => {
                          handleUpdateLocale(index, { region: val, language: locale.language });
                        }}
                      >
                        {region.map(item => (
                          <Option key={item.name} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                      <span style={{ margin: '0 12px' }}>{setting.language}</span>
                      <Select
                        style={{ width: 120 }}
                        value={locale.language}
                        onChange={val => {
                          handleUpdateLocale(index, { region: locale.region, language: val });
                        }}
                      >
                        {languages?.map(item => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                      {/* <PlusOutlined
                        style={iconStyle}
                        onClick={() => {
                          handleAddLocale(index + 1);
                        }}
                      /> */}
                      <MinusOutlined
                        style={iconStyle}
                        onClick={() => {
                          handleRemoveLocale(index);
                        }}
                      />
                    </Col>
                  </Row>
                );
              })}
            </Col>
            <Col span={10} offset={6}>
              <Button type="dashed" onClick={() => handleAddLocale(editApplication?.localeObjects?.length || 0)} block>
                <PlusOutlined style={{ marginRight: 8, cursor: 'pointer' }} />
                {applicationI18n.addLocale}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={3} type="secondary" style={{ textAlign: 'right' }}>
                {setting.resource}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={18} offset={6}>
              {editApplication?.resources?.map((resource, index) => {
                return (
                  <Row style={{ display: 'block' }} key={resource.id}>
                    <ResourceLabel style={{ width: 38 }}>{global.nameLabel}</ResourceLabel>
                    <Input
                      value={resource.name}
                      style={{ width: 200 }}
                      onChange={e => {
                        handleUpdateResource(index, 'name', e.target.value);
                      }}
                    />
                    <ResourceLabel style={{ marginLeft: 12 }}>{global.type}</ResourceLabel>
                    <Select
                      style={{ width: 200 }}
                      value={resource.type}
                      onChange={val => {
                        handleUpdateResource(index, 'type', val);
                      }}
                    >
                      {ResourceTypeArray?.map(item => (
                        <Option key={item.type} value={item.type}>
                          {resourceI18n[item.label]}
                        </Option>
                      ))}
                    </Select>
                    <br />
                    <ResourceLabel style={{ width: 38 }}>{global.host}</ResourceLabel>
                    <Input
                      value={resource.detail.host}
                      style={{ width: 200 }}
                      onChange={e => {
                        handleUpdateResource(index, 'detail', {
                          host: e.target.value,
                          downloadHost: resource.detail.downloadHost,
                        });
                      }}
                    />
                    <ResourceLabel style={{ marginLeft: 12 }}>{setting.downloadHost}</ResourceLabel>
                    <Input
                      value={resource.detail.downloadHost}
                      style={{ width: 200 }}
                      onChange={e => {
                        handleUpdateResource(index, 'detail', {
                          downloadHost: e.target.value,
                          host: resource.detail.host,
                        });
                      }}
                    />

                    {/* <PlusOutlined
                      style={{ margin: '8px 0 0 8px', cursor: 'pointer' }}
                      onClick={() => {
                        handleAddResource(index + 1);
                      }}
                    /> */}
                    <MinusOutlined
                      style={{ margin: '8px 0 0 8px', cursor: 'pointer' }}
                      onClick={() => {
                        handleRemoveResource(index);
                      }}
                    />
                  </Row>
                );
              })}
            </Col>
            <Col span={10} offset={6}>
              <Button type="dashed" onClick={() => handleAddResource(editApplication?.resources?.length || 0)} block>
                <PlusOutlined style={{ marginRight: 8, cursor: 'pointer' }} />
                {applicationI18n.addResource}
              </Button>
            </Col>
          </Row>

          <Row>
            <Col span={10} offset={6}>
              <Button type="primary" onClick={() => handleSave()} block>
                {global.save}
              </Button>
            </Col>
          </Row>
        </div>
      </Spin>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
