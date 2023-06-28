import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { MinusOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Col, Input, message, Row as AntdRow, Select, Spin, Tooltip, Typography } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ResourceTypeArray } from '@/constants/resource';
import { GlobalContext } from '@/pages/system';
import * as ACTIONS from '@/store/actions/applications/detail/settings/application';
import { ApplicationEntityMultiHost, ApplicationRegion } from '@/types/index';
import { objectEmptyCheck } from '@/utils/index';

const { Option } = Select;

const Title = styled(Typography.Title)`
  margin-bottom: 0 !important;
  margin-top: 12px;
  padding-right: 12px;
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

const ScrollCon = styled.div`
  max-height: ${(props: { maxHeight: number }) => props.maxHeight + 'px'};
  overflow: auto;
  overflow-y: overlay;
`;

const iconStyle = {
  margin: '8px 0 0 8px',
  cursor: 'pointer',
};

const cloneApplication = (application) => {
  return Object.assign({}, application);
};

const mapStateToProps = (store: RootState) => ({
  locales: store.applications.detail.settings.app.locales,
  loading: store.applications.detail.settings.app.loading,
  application: store.applications.detail.settings.app.application,
  applicationId: store.applications.detail.settings.app.applicationId,
});

const mapDispatchToProps = {
  updateApplicationId: ACTIONS.updateApplicationId,
  fetchApplicationInfo: ACTIONS.fetchApplicationInfo,
  fetchAllLocales: ACTIONS.fetchAllLocales,
  saveApplication: ACTIONS.saveApplication,
};

type SettingType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<SettingType> = (props) => {
  const {
    application,
    applicationId,
    loading,
    locales,
    updateApplicationId,
    fetchApplicationInfo,
    fetchAllLocales,
    saveApplication,
  } = props;
  const [region, setRegion] = useState<Array<ApplicationRegion>>([]);
  const [editApplication, setEditApplication] = useState<ApplicationEntityMultiHost | undefined>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, setting, resource: resourceI18n, application: applicationI18n } = locale.business;

  // generate iframe src
  const defaultHost = editApplication?.host?.length ? editApplication?.host[0].url : '';
  const slug = editApplication?.slug || '';
  const hostSlug = defaultHost && slug ? `${defaultHost}/${slug}` : '';
  const { localeObjects = [] } = editApplication || {};

  useEffect(() => {
    if (applicationId) {
      fetchApplicationInfo(applicationId);
      fetchAllLocales(applicationId);

      // push application id to store
      updateApplicationId(applicationId);
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
          ? host.map((item) => ({
              url: !!item?.url ? item.url : item,
              locales: !!item?.locales ? item.locales : [],
            }))
          : [],
      } as any);
    }
  }, [application]);

  useEffect(() => {
    const newRegion: ApplicationRegion[] = [];
    if (locales) {
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
    }

    setRegion(newRegion);
  }, [locales]);

  const handleQuickAddLocales = useCallback(() => {
    const newEditApplication = cloneApplication(editApplication);
    if (newEditApplication) {
      const _localeObjects: ApplicationEntityMultiHost['localeObjects'] = [];
      region.forEach((item) => {
        const { languages = [], name } = item;
        languages.forEach((lan) => {
          if (lan) {
            _localeObjects.push({ region: name, language: lan });
          }
        });
      });
      newEditApplication.localeObjects = _localeObjects;

      setEditApplication(newEditApplication);
    }
  }, [editApplication]);

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

  const handleSave = useCallback(() => {
    if (editApplication) {
      if (!editApplication.name) {
        message.warn(applicationI18n.nameInvalid);
        return;
      }

      for (const localeObj of editApplication.localeObjects) {
        if (!localeObj.region) {
          message.warn(applicationI18n.regionInvalid);
          return;
        }
        if (!localeObj.language) {
          message.warn(applicationI18n.languageInvalid);
          return;
        }
      }

      for (const resource of editApplication.resources) {
        const { detail, name, type } = resource;
        if (!name) {
          message.warn(applicationI18n.resourceNameInvalid);
          return;
        }
        if (!type) {
          message.warn(applicationI18n.resourceTypeInvalid);
          return;
        }
        if (!detail?.host) {
          message.warn(applicationI18n.hostInvalid);
          return;
        }
      }

      saveApplication(editApplication);
    }
  }, [editApplication]);

  return (
    <Content>
      <FoxPageContent
        breadcrumb={<FoxPageBreadcrumb breadCrumb={[{ name: setting.appSetting }]} />}
        style={{ overflow: 'hidden auto' }}>
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
                {global.locale} {!!localeObjects.length ? <>( {localeObjects.length} )</> : null}
              </Title>
            </Col>
          </Row>
          <Row>
            <Col span={6}></Col>
            <Col span={10}>
              <ScrollCon maxHeight={220}>
                {localeObjects.map((locale, index) => {
                  const languages = region.find((item) => item.name === locale.region)?.languages;
                  return (
                    <Row key={`${locale.region}${locale.language}`}>
                      <Label>{setting.region}</Label>
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
                            disabled={localeObjects.find(
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
                      <MinusOutlined
                        style={iconStyle}
                        onClick={() => {
                          handleRemoveLocale(index);
                        }}
                      />
                      {/* </Col> */}
                    </Row>
                  );
                })}
              </ScrollCon>
            </Col>
          </Row>
          <Row>
            <Col span={10} offset={6}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button type="dashed" onClick={() => handleAddLocale(localeObjects.length || 0)} block>
                  <PlusOutlined style={{ marginRight: 8, cursor: 'pointer' }} />
                  {applicationI18n.addLocale}
                </Button>
                <Button
                  type="dashed"
                  onClick={() => handleQuickAddLocales()}
                  style={{ flex: '0 0 120px', marginLeft: 8 }}
                  block>
                  <ThunderboltOutlined />
                  {applicationI18n.quicklyDefault}
                </Button>
              </div>
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
            <Col span={16}>
              <ScrollCon maxHeight={220}>
                {editApplication?.host?.map((host, index) => (
                  <Row key={`host-${index}`}>
                    <Col span={9}>
                      <Label>{global.host}</Label>
                    </Col>
                    <Col span={15}>
                      <Input
                        value={host?.url}
                        onChange={(e) => {
                          handleUpdateHost(index, 'url', e.target.value);
                        }}
                        style={{ width: 180 }}
                      />
                      <span style={{ margin: '0 12px' }}>{global.locale}</span>
                      <Select
                        showArrow
                        allowClear
                        mode="multiple"
                        maxTagCount={1}
                        options={localeOptions}
                        value={host?.locales || []}
                        onChange={(value) => handleUpdateHost(index, 'locales', value)}
                        style={{ width: 204 }}
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
              </ScrollCon>
            </Col>
          </Row>
          <Row>
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
            <Col span={6}>
              <Label>{setting.slug}</Label>
            </Col>
            <Col span={10}>
              <Input
                value={editApplication?.slug}
                onChange={(e) => {
                  handleUpdate('slug', e.target.value);
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={6}>
              <Title level={5} type="secondary" style={{ textAlign: 'right' }}>
                {setting.resource}
              </Title>
            </Col>
          </Row>
          {editApplication?.resources?.map((resource, index) => (
            <React.Fragment key={resource.id}>
              <Row>
                <Col span={6}>
                  <Label>{global.nameLabel}</Label>
                </Col>
                <Col span={10}>
                  <Input
                    value={resource.name}
                    style={{ width: 180 }}
                    onChange={(e) => {
                      handleUpdateResource(index, 'name', e.target.value);
                    }}
                  />
                  <span style={{ display: 'inline-block', width: 64, margin: '0 12px', textAlign: 'right' }}>
                    {global.type}
                  </span>
                  <Select
                    style={{ width: 190 }}
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
                </Col>
              </Row>
              <Row style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Label>{global.host}</Label>
                </Col>
                <Col span={10}>
                  <Input
                    value={resource.detail.host}
                    style={{ width: 180 }}
                    onChange={(e) => {
                      handleUpdateResource(index, 'detail', {
                        host: e.target.value,
                        downloadHost: resource.detail.downloadHost,
                      });
                    }}
                  />
                  <Tooltip title={setting.downloadHost}>
                    <span
                      style={{ display: 'inline-block', width: 64, margin: '0 12px', textAlign: 'right' }}>
                      {setting.download}
                    </span>
                  </Tooltip>
                  <Input
                    value={resource.detail.downloadHost}
                    style={{ width: 190 }}
                    onChange={(e) => {
                      handleUpdateResource(index, 'detail', {
                        downloadHost: e.target.value,
                        host: resource.detail.host,
                      });
                    }}
                  />
                  <MinusOutlined
                    style={{ margin: '8px 0 0 8px', cursor: 'pointer' }}
                    onClick={() => {
                      handleRemoveResource(index);
                    }}
                  />
                </Col>
              </Row>
            </React.Fragment>
          ))}
          <Row>
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
            <Col span={6}>
              <Label>{setting.editor}</Label>
            </Col>
            <Col span={10}>{hostSlug ? `${hostSlug}/_foxpage/designer` : '-'}</Col>
          </Row>
          <Row>
            <Col span={6}>
              <Label>{setting.preview}</Label>
            </Col>
            <Col span={10}>{hostSlug ? `${hostSlug}/_foxpage/preview` : '-'}</Col>
          </Row>
          <Row>
            <Col span={6}>
              <Label>{setting.debugger}</Label>
            </Col>
            <Col span={10}>{hostSlug ? `${hostSlug}/_foxpage/debug` : '-'}</Col>
          </Row>
          <Row>
            <Col span={10} offset={6}>
              <Button block type="primary" onClick={() => handleSave()} style={{ marginTop: 12 }}>
                {global.save}
              </Button>
            </Col>
          </Row>
        </Spin>
      </FoxPageContent>
    </Content>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
