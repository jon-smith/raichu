import * as React from 'react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { readFileAsText } from '@utils/file-utils';
import { GpxData, parseGPXFile } from '@utils/activity-data/gpxparsing';

export type FileAndGpx = { file: File, gpx: GpxData };

type GpxFileDropProps = {
	loadedFiles: FileAndGpx[];
	setLoadedFiles(files: FileAndGpx[]): void;
};

const GpxFileDrop = (props: GpxFileDropProps) => {

	const { loadedFiles, setLoadedFiles } = props;

	const addFiles = useCallback((files: FileAndGpx[]) => {
		setLoadedFiles([...loadedFiles, ...files]);
	}, [loadedFiles, setLoadedFiles]);

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		// Read all files as strings asynchronously
		const readers = acceptedFiles.map(async f => await readFileAsText(f));
		const fileStrings = await Promise.all(readers);

		// Convert to gpx
		const gpx = fileStrings.map(f => parseGPXFile(f));
		const filesAndGpx = acceptedFiles.map((f, i) => ({ file: f, gpx: gpx[i] }));

		addFiles(filesAndGpx);

	}, [addFiles]);

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	const files = loadedFiles.map(file => (
		<li key={file.file.name}>
			{file.file.name} - {file.file.size} bytes
		</li>
	));

	return (
		<section className="file-uploader">
			<div {...getRootProps({ className: 'dropzone' })}>
				<input {...getInputProps()} />
				<p>Drag and drop GPX files here, or click to use the file browser</p>
			</div>
			<aside>
				<h4>Files</h4>
				<ul>{files}</ul>
			</aside>
		</section>
	);
};

export default GpxFileDrop;