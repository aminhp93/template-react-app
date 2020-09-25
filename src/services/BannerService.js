import { getJson, setJson } from 'utils/storage';

class BannerService {
  setBanner = (bannerName, value) => {
    const key = `${bannerName}`;
    setJson(key, value);
  };

  getBanner = (bannerName) => {
    const key = `${bannerName}`;
    return getJson(key);
  };

  showBanner = (bannerName) => {
    this.setBanner(bannerName, true);
  };

  hideBanner = (bannerName) => {
    this.setBanner(bannerName, false);
  };

  shouldShowUser = (bannerName, user) => {
    if (!user.isStaff()) {
      return false;
    }
    return this.getBanner(bannerName) === true;
  };
}

const bannerService = new BannerService();

export default bannerService;
