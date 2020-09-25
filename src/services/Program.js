import FilterService from './Filter';

const ProgramService = {
  async getPrograms() {
    return FilterService.getFilterValues('programs').then((res) => res);
  },
};

export default ProgramService;
