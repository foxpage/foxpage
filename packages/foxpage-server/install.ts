import { PRE } from './config/constant';
import * as Service from './src/services';
import { NewOrgParams } from './src/types/organization-types';
import dbConnect from './src/utils/mongoose';
import { generationId } from './src/utils/tools';

try {
  dbConnect();
  const install = async () => {
    // check server has init
    const [orgList, userList] = await Promise.all([Service.org.getList({}), Service.user.getList({})]);
    if (orgList.length > 0 || userList.length > 0) {
      console.error('System has installed, please check to empty database and retry');
    } else {
      const result = await setupSql();

      console.log(
        `Init server success, default user account is ${result.accountPwd}, password is ${result.accountPwd}`,
      );
    }

    process.exit(0);
  };

  const setupSql = async () => {
    const ctx: any = {
      operations: [],
      transactions: [],
    };

    // create user
    const userId = generationId(PRE.USER);
    const accountPwd = 'admin';
    Service.user.addNewUser(
      {
        id: userId,
        account: accountPwd, // default account
        email: '',
        nickName: '',
        registerType: 1,
        deleted: false,
        changePwdStatus: true,
        password: accountPwd, // default account password
      },
      { ctx },
    );

    // create default organization
    const orgId = generationId(PRE.ORGANIZATION);
    const newOrganization: NewOrgParams = {
      id: orgId,
      name: 'demo organization',
      creator: userId,
    };
    ctx.transactions.push(Service.org.addDetailQuery(newOrganization));

    // add user to organization
    Service.org.addNewMembers(orgId, [userId], { ctx });

    await Service.org.runTransaction(ctx.transactions);

    return { accountPwd };
  };

  install();
} catch (err) {
  console.log('Install server cause error: ' + (err as Error).message);
}
