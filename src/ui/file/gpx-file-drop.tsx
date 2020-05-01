import * as React from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { readFileAsText } from 'shared/utils/file-utils';
import { GpxData, parseGPXFile } from 'shared/activity-data/gpxparsing';

export type FileAndGpx = { file: File; gpx: GpxData };

type GpxFileDropProps = {
	allowMultiple?: boolean;
	onAddFiles(file: FileAndGpx[]): void;
};

const GpxFileDrop = (props: GpxFileDropProps) => {
	const { onAddFiles, allowMultiple = true } = props;

	const addFiles = useCallback(
		(files: FileAndGpx[]) => {
			onAddFiles(files);
		},
		[onAddFiles]
	);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			// Read all files as strings asynchronously
			const readers = acceptedFiles.map(async f => readFileAsText(f));
			const fileStrings = await Promise.all(readers);

			// Convert to gpx
			const gpx = fileStrings.map(f => parseGPXFile(f));
			const filesAndGpx = acceptedFiles.map((f, i) => ({ file: f, gpx: gpx[i] }));

			addFiles(filesAndGpx);
		},
		[addFiles]
	);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: '.gpx',
		multiple: allowMultiple
	});

	return (
		<section className="file-uploader">
			<div {...getRootProps({ className: 'dropzone' })}>
				<input {...getInputProps()} />
				<p>Drag and drop GPX files here, or click to use the file browser</p>
			</div>
		</section>
	);
};

export default GpxFileDrop;
