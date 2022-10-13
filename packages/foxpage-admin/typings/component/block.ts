import { Content } from "../builder/content";
import { BaseResponse } from "../common";

export interface FetchLiveBlockDslRes extends BaseResponse<Record<string, Content>> {};
