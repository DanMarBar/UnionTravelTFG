import router from "./index.js";
import {googleAuth, redirectToGoogle} from "../controller/Oauth.js";

router.get('/google', redirectToGoogle);
router.get('/authenticate', googleAuth);

export default router