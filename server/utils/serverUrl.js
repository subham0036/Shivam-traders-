/** Fix common Render URL typo: 10j7 (digit one) vs l0j7 (letter L) */
export const fixRenderUrlTypo = (url = '') => {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/shivam-traders-10j7/gi, 'shivam-traders-l0j7');
};

export const getServerBaseUrl = () =>
  fixRenderUrlTypo((process.env.SERVER_URL || '').replace(/\/$/, ''));
