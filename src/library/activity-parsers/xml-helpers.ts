export function getElementValue(parent: Element, name: string) {
	const elem = parent.getElementsByTagName(name)[0];
	return elem && elem.innerHTML;
}

export function getNumericChildElementValue(parent: Element, name: string): number | undefined {
	const el = getElementValue(parent, name);
	return el ? parseFloat(el) : undefined;
}

export function getNumericAttributeValue(parent: Element, name: string): number | undefined {
	const att = parent.getAttribute(name);
	return att ? parseFloat(att) : undefined;
}
