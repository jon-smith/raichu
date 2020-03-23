import { useDispatch } from 'react-redux';
import { ActivityAction } from './activityActions';

export type RootActions = ActivityAction[keyof ActivityAction];
