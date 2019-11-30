import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@material-ui/core';

const useStyles = makeStyles(theme =>
	createStyles({
		root: {
			width: '100%',
		},
		paper: {
			marginTop: theme.spacing(3),
			width: '100%',
			overflowX: 'auto',
			marginBottom: theme.spacing(2),
		},
		table: {
			minWidth: 650,
		},
	}),
);

interface ActivityData {
	filename: string;
	name: string;
	date?: Date;
}

interface Props {
	rows: ActivityData[];
}

const ActivitySummaryTable = (props: Props) => {

	const classes = useStyles();

	const { rows } = props;

	return (
		<div className={classes.root}>
			<Paper className={classes.paper}>
				<Table className={classes.table} size="small" aria-label="activity table">
					<TableHead>
						<TableRow>
							<TableCell>Filename</TableCell>
							<TableCell align="right">Name</TableCell>
							<TableCell align="right">Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.map((row, i) => (
							<TableRow key={i}>
								<TableCell component="th" scope="row">
									{row.filename}
								</TableCell>
								<TableCell align="right">{row.name}</TableCell>
								<TableCell align="right">{String(row.date)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>
		</div>
	);
};

export default ActivitySummaryTable;