import * as ArrayUtils from 'shared/utils/array-utils';

import { ActivityPoint } from './shared-structures';
import * as Helper from './xml-helpers';

interface Track {
	points: ActivityPoint[];
}

interface TcxLap {
	tracks: Track[];
}

export interface TcxActivity {
	id: string;
	laps: TcxLap[];
}

export interface TcxData {
	activities: TcxActivity[];
}

function parseTrackPoint(pointElement: Element): ActivityPoint {
	const time = Helper.getElementValue(pointElement, 'Time') || '';
	const lat = Helper.getNumericChildElementValue(pointElement, 'LatitudeDegrees');
	const lon = Helper.getNumericChildElementValue(pointElement, 'LongitudeDegrees');

	const distance = Helper.getNumericChildElementValue(pointElement, 'DistanceMeters');
	const elevation = Helper.getNumericChildElementValue(pointElement, 'AltitudeMeters');

	const power = Helper.getNumericChildElementValue(pointElement, 'ns3:Watts');
	const cadence = Helper.getNumericChildElementValue(pointElement, 'Cadence');
	const hrElement = pointElement.querySelector('HeartRateBpm');
	const heartRate = hrElement ? Helper.getNumericChildElementValue(hrElement, 'Value') : undefined;

	return {
		location: lat !== undefined && lon !== undefined ? { lat, lon } : undefined,
		time: new Date(time),
		distance,
		elevation,
		heartRate,
		cadence,
		power
	};
}

function parseTrack(trackElement: Element) {
	return { points: Array.from(trackElement.querySelectorAll('TrackPoint')).map(parseTrackPoint) };
}

function parseLap(lapElement: Element) {
	return { tracks: Array.from(lapElement.querySelectorAll('Track')).map(parseTrack) };
}

function parseActivity(activityElement: Element) {
	const id = Helper.getElementValue(activityElement, 'ID') || '';
	return { id, laps: Array.from(activityElement.querySelectorAll('Lap')).map(parseLap) };
}

export function parseTCXFile(file: string): TcxData {
	const xmlParser = new DOMParser();
	const tcxXml = xmlParser.parseFromString(file, 'text/xml');

	const activitiesNode = tcxXml.querySelector('activities');
	if (activitiesNode) {
		const activities = activitiesNode.querySelectorAll('activity');
		return {
			activities: ArrayUtils.filterNullAndUndefined(Array.from(activities).map(parseActivity))
		};
	}

	return { activities: [] };
}
