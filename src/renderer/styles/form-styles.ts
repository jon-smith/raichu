import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useFormStyles = makeStyles((theme: Theme) =>
	createStyles({
		formControl: {
			margin: theme.spacing(1),
			minWidth: 120
		}
	})
);
