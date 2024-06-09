import router from "./Index.js";
import {githubAuth, redirectToGitHub} from "../controller/Oauth.js";

router.get('/auth/github', redirectToGitHub);
router.get('/authenticate', githubAuth);

export default router