import * as ArrayUtils from '@shared/utils/array-utils';

interface Metadata {
	time: Date;
}

// A geographic point with optional attributes
export interface Point {
	time: Date; // UTC
	lat: number; // Decimal degrees
	lon: number; // Decimal degrees
	elevation_m?: number;

	// Below are extended attributes
	temperature_c?: number;
	cadence?: number; // SPM or RPM
	heartRate?: number; // bpm
	power?: number; // Watts
}

// A Track Segment holds a list of Track Points which are logically connected in order.
// To represent a single GPS track where GPS reception was lost,
// or the GPS receiver was turned off, start a new Track Segment for each continuous span of track data.
interface Segment {
	points: Point[];
}

// Description from GPX spec:
// trk represents a track - an ordered list of points describing a path.
export interface Track {
	name: string;
	segments: Segment[];
}

const getElementValue = (parent: Element, name: string) => {
	const elem = parent.getElementsByTagName(name)[0];
	return elem && elem.innerHTML;
};

const getNumericChildElementValue = (parent: Element, name: string): number | undefined => {
	const el = getElementValue(parent, name);
	return el ? parseFloat(el) : undefined;
};

const getNumericAttributeValue = (parent: Element, name: string): number | undefined => {
	const att = parent.getAttribute(name);
	return att ? parseFloat(att) : undefined;
};

const getMetadata = (metadataNode: Element) => {
	const time = getElementValue(metadataNode, 'time') || '';
	return { time: new Date(time) };
};

const getPoint = (pointNode: Element): Point | undefined => {
	const lat = getNumericAttributeValue(pointNode, 'lat');
	const lon = getNumericAttributeValue(pointNode, 'lon');
	const elevation_m = getNumericChildElementValue(pointNode, 'ele');
	const time = getElementValue(pointNode, 'time') || '';
	const power = getNumericChildElementValue(pointNode, 'power');
	const temperature_c = getNumericChildElementValue(pointNode, 'gpxtpx:atemp');
	const cadence = getNumericChildElementValue(pointNode, 'gpxtpx:cad');
	const heartRate = getNumericChildElementValue(pointNode, 'gpxtpx:hr');

	if (lat != null && lon != null) {
		return {
			lat,
			lon,
			time: new Date(time),
			elevation_m,
			temperature_c,
			heartRate,
			cadence,
			power
		};
	}

	return undefined;
};

const getSegment = (segmentNode: Element): Segment => {
	const points = Array.from(segmentNode.querySelectorAll('trkpt')).map(getPoint);
	return { points: ArrayUtils.filterNullAndUndefined(points) };
};

const getTrack = (trackNode: Element) => {
	const name = getElementValue(trackNode, 'name') || '';
	const segments = Array.from(trackNode.querySelectorAll('trkseg')).map(getSegment);
	return { name, segments };
};

export interface GpxData {
	metadata?: Metadata;
	track: Track;
}

export function parseGPXFile(file: string): GpxData {
	const xmlParser = new DOMParser();
	const gpxXml = xmlParser.parseFromString(file, 'text/xml');

	const metadataNode = gpxXml.querySelector('metadata');
	const trackNode = gpxXml.querySelector('trk');
	const track = trackNode ? getTrack(trackNode) : { name: '', segments: [] };

	return {
		metadata: metadataNode ? getMetadata(metadataNode) : undefined,
		track
	};
}
