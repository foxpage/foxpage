import { AbstractEntity } from '../common';
import { User } from '../user';

export interface TeamMemberEntity extends Pick<User, 'account'> {
  joinTime: string;
  status: boolean;
  userId: string;
}

export interface TeamEntity extends Pick<AbstractEntity, 'id' | 'createTime' | 'creator' | 'updateTime'> {
  deleted: boolean;
  members: TeamMemberEntity[];
  name: string;
  organizationId: string;
}
