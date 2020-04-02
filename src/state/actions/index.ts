import { ActivityAction } from './activityActions';
import { ViewAction } from './viewActions';

export type RootActions = ActivityAction[keyof ActivityAction] | ViewAction[keyof ViewAction];
