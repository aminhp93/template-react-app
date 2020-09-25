import request from 'utils/request';
import { AgreementUrls } from 'config/api';

const AgreementService = {
  getDocumentByKey(documentKey: string) {
    return request({
      method: 'GET',
      url: AgreementUrls.documentByKey(documentKey),
    });
  },

  getAgreementById(agreementId: number) {
    return request({
      method: 'GET',
      url: AgreementUrls.agreementById(agreementId),
    });
  },

  updateAgreement(agreementId, data?: any) {
    return request({
      method: 'PUT',
      url: AgreementUrls.agreementById(agreementId),
      data,
    });
  }
};

export default AgreementService;
