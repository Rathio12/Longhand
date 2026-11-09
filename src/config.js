// The GitHub link lives in electron/app-config.json so the Settings buttons and
// the updater share one value.
import appConfig from '../electron/app-config.json';

export const REPO_URL = appConfig.repoUrl;
