import { Locale } from 'antd/lib/locale-provider';
import { StringLiteralLike } from 'typescript';

import { APP_CONFIG } from './app-config';

declare interface IWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  require: any;
  React: any;
  ReactDOM: any;
  define: (key: string, value: any) => {};
  APP_CONFIG: APP_CONFIG;
}


export interface Locale extends Locale {
  business: {
    global: {
      all: string;
      application: string;
      setting: string;
      management: string;
      project: string;
      team: string;
      user: string;
      projects: string;
      dynamics: string;
      recycles: string;
      condition: string;
      conditions: string;
      variables: string;
      functions: string;
      resources: string;
      packages: string;
      contents: string;
      versions: string;
      dashboard: string;
      type: string;
      modify: string;
      update: string;
      delete: string;
      operator: string;
      nameLabel: string;
      creator: string;
      createTime: string;
      updateTime: string;
      actions: string;
      add: string;
      edit: string;
      delete: string;
      apply: string;
      save: string;
      remove: string;
      view: string;
      search: string;
      build: string;
      locale: string;
      deleteMsg: string;
      yes: string;
      no: string;
      terms: string;
      deleteFailMsg: string;
      host: string;
      select: string;
      height: string;
      width: string;
      label: string;
      deleteSuccess: string;
      publishSuccess: string;
      cloneSuccess: string;
      moveSuccess: string;
      updateSuccess: string;
      saveSuccess: string;
      commitSuccess: string;
      revokeSuccess: string;
      fetchListSuccess: string;
      deleteFailed: string;
      publishFailed: string;
      cloneFailed: string;
      moveFailed: string;
      updateFailed: string;
      saveFailed: string;
      commitFailed: string;
      revokeFailed: string;
      previewFailed: string;
      fetchListFailed: string;
      addFailed: string;
      searchFailed: string;
      nameError: string;
      selectLocale: string;
      nameFormatInvalid: string;
    };
    workspace: {
      name: string;
    };
    organization: {
      name: string;
    };
    store: {
      buy: string;
      name: string;
      commit: string;
      revoke: string;
      commitTitle: string;
      commitMsg: string;
      revokeTitle: string;
      revokeMsg: string;
      commitYes: string;
      commitNo: string;
      fetchResourceFailed: string;
      buyModalTitle: string;
      buySuccess: string;
      buyFailed: string;
    };
    login: {
      loginOut: string;
      password: string;
      account: string;
      loginSuccess: string;
      loginFailed: string;
      noOrganization: string;
      registerSuccess: string;
      registerFailed: string;
    };
    project: {
      add: string;
      edit: string;
      nameLabel: string;
      deleteMessage: string;
    };
    application: {
      add: string;
      new: string;
      edit: string;
      nameLabel: string;
      applicationList: string;
      fetchListFailed: string;
      fetchDetailFailed: string;
      nameInvalid: string;
      slugInvalid: string;
      hostInvalid: string;
      regionInvalid: string;
      languageInvalid: string;
      typeInvalid: string;
      downloadHostInvalid: string;
      resourceNameInvalid: string;
      resourceTypeInvalid: string;
      fetchLocalesFailed: string;
      nameLengthInvalid: string;
      notSelectError: string;
      addLocale: string;
      addResource: string;
      selectApplication: string;
    };
    folder: {
      name: string;
      add: string;
      nameLabel: string;
      deleteTitle: string;
      deleteMsg: string;
    };
    file: {
      name: string;
      add: string;
      edit: string;
      nameLabel: string;
      page: string;
      template: string;
      package: string;
      pathname: string;
      deleteMessage: string;
      filePath: string;
      relPath: string;
      fetchDetailFailed: string;
      fetchPageListFailed: string;
    };
    content: {
      name: string;
      add: string;
      edit: string;
      nameLabel: string;
      deleteMessage: string;
      query: string;
      fetchFailed: string;
    };
    team: {
      add: string;
      edit: string;
      userCount: string;
      nameLabel: string;
      userManagement: string;
      addUser: string;
      userId: string;
      joinTime: string;
      account: string;
      selectUserPlaceHolder: string;
      accountInfo: string;
      fetchUsersFailed: string;
    };
    condition: {
      add: string;
      name: string;
      nameLabel: string;
      arithmeticLogic: string;
      deleteFailMsg: string;
      time: string;
      show: string;
      hide: string;
      general: string;
      advanced: string;
      timezoneSelect: string;
      selectCondition: string;
      fetchFailed: string;
    };
    function: {
      name: string;
      add: string;
      nameLabel: string;
      fetchFailed: string;
    };
    package: {
      component: string;
      editor: string;
      library: string;
      fetchFailed: string;
      setVersionLiveTip: string;
    };
    component: {
      add: string;
      fetchListFailed: string;
      fetchDetailFailed: string;
      fetchUpdateInfoFailed: string;
    };
    editor: {
      add: string;
    };
    library: {
      add: string;
    };
    version: {
      liveVersion: string;
      add: string;
      edit: string;
      name: string;
      source: string;
      dependency: string;
      config: string;
      useStyleEditor: string;
      enableChildren: string;
      changelog: string;
      versionError: string;
      status: string;
      publish: string;
      republish: string;
      live: string;
      componentVersion: string;
      syncTitle: string;
    };
    resource: {
      group: string;
      groupError: string;
      resourceFolder: string;
      resourceVersion: string;
      deleteTitle: string;
      deleteMsg: string;
      resourceGroup: string;
      addResourceGroup: string;
      addGroup: string;
      editGroup: string;
      groupName: string;
      groupType: string;
      groupInfo: string;
      manifestPath: string;
      selfBuild: string;
      thirdParty: string;
    };
    setting: {
      basicInfo: string;
      accessControl: string;
      Introduction: string;
      downloadHost: string;
      region: string;
      language: string;
      resource: string;
      slug: string;
    };
    builder: {
      componentList: string;
      componentSearch: string;
      pageStyle: string;
      pad: string;
      pc: string;
      mobile: string;
      zoom: string;
      more: string;
      preview: string;
      pageStore: string;
      lastStep: string;
      nextStep: string;
      selectTemplateError: string;
      selectPageError: string;
      selectPageModalTitle: string;
      selectTemplateModalTitle: string;
      noComponentError: string;
      selectPage: string;
      componentCopyMsg: string;
      componentDeleteMsg: string;
      fetchDslFailed: string;
      fetchCatalogFailed: string;
      fetchTemplateFailed: string;

    };
    variable: {
      title: string;
      add: string;
      edit: string;
      args: string;
      value: string;
      selectFunction: string;
      fetchFailed: string;
      fetchDetailFailed: string;
      notExist: string;
      useVariableTitle: string;
      useVariableTip: string;
      useVariableAttrTip: string;
      content: string;
    };
  };
}