export const DISTRICTS = {
    'Gasabo': [
        'Bumbogo',
        'Gatsata',
        'Gikomero',
        'Gisozi',
        'Jabana',
        'Jali',
        'Kacyiru',
        'Kimihurura',
        'Kimironko',
        'Kinyinya',
        'Ndera',
        'Nduba',
        'Remera',
        'Rusororo',
        'Rutunga'
    ],
    'Kicukiro': [
        'Gatenga',
        'Kicukiro',
        'Gikondo',
        'Kagarama',
        'Kanombe',
        'Masaka',
        'Niboye',
        'Nyarugunga'
    ],
    'Nyarugenge': [
        'Kigali',
        'Mageragere',
        'Nyamirambo',
        'Nyakabanda',
        'Muhima',
        'Rwezamenyo',
        'Gitega',
        'Kanyinya',
        'Kimisagara'
    ]
};

export const getDistricts = () => {
    return Object.keys(DISTRICTS);
};
export const getSectorsByDistrict = (district) => {
    return DISTRICTS[district] || [];
};
export const getAllSectors = () => {
    return Object.values(DISTRICTS).flat();
};

export const formatLocation = (district, sector) => {
    if (!district || !sector) return '';
    return `${district} - ${sector}`;
};

export const parseLocation = (locationString) => {
    if (!locationString) return { district: '', sector: '' };
    const [district, sector] = locationString.split(' - ');
    return { district: district || '', sector: sector || '' };
};