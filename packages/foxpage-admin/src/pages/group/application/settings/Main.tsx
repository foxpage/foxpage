import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row as AntdRow, Select, Spin, Typography } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/settings';
import { ResourceTypeArray } from '@/constants/resource';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import { ApplicationEditType, RegionType } from '@/types/application';
import { ContentUrlParams } from '@/types/application/content';
import { objectEmptyCheck } from '@/utils/object-empty-check';

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

const cloneApplication = (application) => {
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

const Main: React.FC<SettingType> = (props) => {
  const { applicationId } = useParams<ContentUrlParams>();
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
  const host = editApplication?.host?.length ? editApplication?.host[0].url : '';
  const slug = editApplication?.slug || '';
  const hostSlug = host && slug ? `${host}/${slug}` : '';

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
      const { locales = [], resources = [], host } = application;
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
        host: !objectEmptyCheck(host)
          ? host.map((item) => {
              const hostWithoutLocale = typeof item === 'string';
              return hostWithoutLocale
                ? {
                    url: item,
                    locales: [],
                  }
                : item;
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
          const exist = newRegion.find((item) => item.name === array[1]);
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

  const localeOptions = useMemo(() => {
    if (editApplication) {
      const { localeObjects } = editApplication;
      return !objectEmptyCheck(localeObjects)
        ? localeObjects.map((item) => ({
            label: `${item.language}-${item.region}`,
            value: `${item.language}-${item.region}`,
          }))
        : [];
    } else {
      return [];
    }
  }, [editApplication]);

  const handleRemoveHost = useCallback(
    (index: number) => {
      const newEditApplication = _.cloneDeep(editApplication);
      newEditApplication?.host.splice(index, 1);
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleAddHost = useCallback(
    (index: number) => {
      const newEditApplication = _.cloneDeep(editApplication);
      newEditApplication?.host.splice(index, 0, { url: '', locales: [] });
      setEditApplication(newEditApplication);
    },
    [editApplication],
  );

  const handleUpdateHost = useCallback(
    (index: number, key: string, value: string | string[]) => {
      const newEditApplication = _.cloneDeep(editApplication);
      if (newEditApplication) {
        newEditApplication.host[index][key] = value;
        setEditApplication(newEditApplication);
      }
    },
    [editApplication],
  );

  return (
    <React.Fragment>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              {
                name: applicationI18n.applicationList,
                link: '/#/workspace/application',
              },
              { name: global.setting },
            ]}
          />
        }>
        <Spin spinning={loading}>
          <Row>
            <Col span={6}>
              <Title level={5} type="secondary" style={{ textAlign: 'right' }}>
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
                onChange={(e) => {
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
                onChange={(e) => {
                  handleUpdate('intro', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={5} type="secondary" style={{ textAlign: 'right' }}>
                {global.locale}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={18} offset={6}>
              {editApplication?.localeObjects?.map((locale, index) => {
                const languages = region.find((item) => item.name === locale.region)?.languages;
                return (
                  <Row key={`${locale.region}${locale.language}`}>
                    <Col span={25}>
                      <span style={{ marginRight: 12 }}>{setting.region}</span>
                      <Select
                        value={locale.region}
                        style={{ width: 120 }}
                        onChange={(val) => {
                          handleUpdateLocale(index, { region: val, language: locale.language });
                        }}>
                        {region.map((item) => (
                          <Option key={item.name} value={item.name}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                      <span style={{ margin: '0 12px' }}>{setting.language}</span>
                      <Select
                        style={{ width: 120 }}
                        value={locale.language}
                        onChange={(val) => {
                          handleUpdateLocale(index, { region: locale.region, language: val });
                        }}>
                        {languages?.map((item, index) => (
                          <Option
                            disabled={editApplication.localeObjects.find(
                              (localeItem, localeIndex) =>
                                localeItem.language === item &&
                                locale.region === localeItem.region &&
                                localeIndex !== index,
                            )}
                            key={item}
                            value={item}>
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
              <Button
                type="dashed"
                onClick={() => handleAddLocale(editApplication?.localeObjects?.length || 0)}
                block>
                <PlusOutlined style={{ marginRight: 8, cursor: 'pointer' }} />
                {applicationI18n.addLocale}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={5} type="secondary" style={{ textAlign: 'right' }}>
                {setting.accessControl}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={18} offset={6}>
              {editApplication?.host?.map((host, index) => (
                <Row key={`host-${index}`}>
                  <Col span={25}>
                    <ResourceLabel style={{ width: 38, marginBottom: 0 }}>{global.host}</ResourceLabel>
                    <Input
                      value={host?.url}
                      onChange={(e) => {
                        handleUpdateHost(index, 'url', e.target.value);
                      }}
                      style={{ width: 200 }}
                    />
                    <ResourceLabel style={{ marginLeft: 12, marginBottom: 0, textAlign: 'right' }}>
                      {global.locale}
                    </ResourceLabel>
                    <Select
                      showArrow
                      allowClear
                      mode="multiple"
                      maxTagCount={2}
                      options={localeOptions}
                      value={host?.locales || []}
                      onChange={(value) => handleUpdateHost(index, 'locales', value)}
                      style={{ width: 232 }}
                    />
                    <MinusOutlined
                      style={iconStyle}
                      onClick={() => {
                        handleRemoveHost(index);
                      }}
                    />
                  </Col>
                </Row>
              ))}
            </Col>
            <Col span={10} offset={6}>
              <Button
                type="dashed"
                onClick={() => handleAddHost(editApplication?.host?.length || 0)}
                block
                style={{ marginBottom: 12 }}>
                <PlusOutlined style={{ marginRight: 8, cursor: 'pointer' }} />
                {applicationI18n.addHost}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={18} offset={6}>
              <Row>
                <Col span={25}>
                  <ResourceLabel style={{ width: 38 }}>{setting.slug}</ResourceLabel>
                  <Input
                    value={editApplication?.slug}
                    onChange={(e) => {
                      handleUpdate('slug', e.target.value);
                    }}
                    style={{ width: 554 }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={5} type="secondary" style={{ textAlign: 'right' }}>
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
                      onChange={(e) => {
                        handleUpdateResource(index, 'name', e.target.value);
                      }}
                    />
                    <ResourceLabel style={{ marginLeft: 12, textAlign: 'right' }}>
                      {global.type}
                    </ResourceLabel>
                    <Select
                      style={{ width: 232 }}
                      value={resource.type}
                      onChange={(val) => {
                        handleUpdateResource(index, 'type', val);
                      }}>
                      {ResourceTypeArray?.map((item) => (
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
                      onChange={(e) => {
                        handleUpdateResource(index, 'detail', {
                          host: e.target.value,
                          downloadHost: resource.detail.downloadHost,
                        });
                      }}
                    />
                    <ResourceLabel style={{ marginLeft: 12, textAlign: 'right' }}>
                      {setting.downloadHost}
                    </ResourceLabel>
                    <Input
                      value={resource.detail.downloadHost}
                      style={{ width: 232 }}
                      onChange={(e) => {
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
              <Button
                type="dashed"
                onClick={() => handleAddResource(editApplication?.resources?.length || 0)}
                block>
                <PlusOutlined style={{ marginRight: 8, cursor: 'pointer' }} />
                {applicationI18n.addResource}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={5} type="secondary" style={{ textAlign: 'right' }}>
                {setting.other}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={18} offset={6}>
              <Row style={{ display: 'block' }}>
                <ResourceLabel style={{ margin: '0 0 0 0' }}>{setting.editor}</ResourceLabel>
                {hostSlug ? `${hostSlug}/_foxpage/visual-editor.html` : '-'}
              </Row>
              <Row style={{ display: 'block' }}>
                <ResourceLabel style={{ margin: '0 0 0 0' }}>{setting.preview}</ResourceLabel>
                {hostSlug ? `${hostSlug}/_foxpage/preview` : '-'}
              </Row>
              <Row style={{ display: 'block' }}>
                <ResourceLabel style={{ margin: '0 0 0 0' }}>{setting.debugger}</ResourceLabel>
                {hostSlug ? `${hostSlug}/_foxpage/debug` : '-'}
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={10} offset={6}>
              <Button type="primary" onClick={() => handleSave()} block>
                {global.save}
              </Button>
            </Col>
          </Row>
        </Spin>
      </FoxpageDetailContent>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
