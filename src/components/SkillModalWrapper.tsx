import * as React from 'react';
import { connect } from 'react-redux';
import { get, uniq } from 'lodash';
import { TreeSelect, AutoComplete, Modal, Tooltip } from 'antd';

import ConfirmModal from 'components/messaging/ConfirmModal';
import { updateProfileSkill } from 'reducers/selectedProfile';
import { fetchSkillList, getUserSkills } from 'reducers/users';
import { ModalKey } from 'types';
import { SearchOutlined } from '@ant-design/icons';

import ARROW_DOWN_ICON from '@img/arrow-down-sign-to-navigate-1.svg';
import TICK_ICON from '@img/small-tick.svg';

interface IProps {
  onModalClose: any,
  selectedConversation: any,
  updateProfileSkill: any,
  fetchSkillList: any,
  getUserSkills: any,
  cb: any,
}

interface IState {
  value: string,
  textSearch: string,
  suggestionList: any,
  selectedSkills: any,
  error: string,
  showTree: boolean,
  treeData: any,
  visibleConfirm: boolean,
  dropdownOpen: boolean,
}

const { Option } = AutoComplete;

class SkillModalWrapper extends React.PureComponent<IProps, IState> {
  defaultSkillList: any;

  constructor(props) {
    super(props);
    this.state = {
        textSearch: '',
        value: '',
        suggestionList: [],
        selectedSkills: [],
        error: '',
        showTree: false,
        treeData: [],
        visibleConfirm: false,
        dropdownOpen: false,
    };

  }

  handleOnOk = async () => {
    const { selectedSkills } = this.state;
    await this.props.updateProfileSkill(selectedSkills)
    this.props.cb()
  };

  mapTreeData = (data, defaultData) => {
    const result = [];
    let listCatgory = (uniq(data.map(i => i.category))).sort();
    const index = listCatgory.indexOf('Others');
    if (index > -1) {
      const others = listCatgory.splice(index, 1)
      listCatgory = listCatgory.concat(others)
    }
        
    listCatgory.map(i=> {
      const children = [];
      data.filter(j => j.category === i).map(j => {
        const selected = defaultData.map(i => i.name).indexOf(j.name) > -1;
        children.push({
          title: <div>{j.name} {selected && <img src={TICK_ICON} />}</div>,
          value: j.name,
          key: j.name,
          obj: j
        })
      })
      children.sort((a, b) => a.value.localeCompare(b.value))
      const obj = {
        title: i,
        value: i,
        key: i,
        children
      }
      result.push(obj)
    })
    return result
  }

  async componentDidMount() {
    this.defaultSkillList = await this.props.fetchSkillList()
    const res = await this.props.getUserSkills()
    const treeData = this.mapTreeData(this.defaultSkillList, res.data);
    this.setState({ 
      suggestionList: this.defaultSkillList.sort((a, b) => a.name.localeCompare(b.name)),
      treeData,
      selectedSkills: res.data
    });
  }

  handleConfirm = () => {
    this.setState({
      visibleConfirm: true
    })
  }

  renderItem = data => {
      const { name, isDefault } = data;
      const { selectedSkills } = this.state;
      const selected = selectedSkills.map(i => i.name).indexOf(name) > -1;
      return <div>
        {name} <span>{isDefault ? '- Click to create a new skill' : ''}</span>
        {selected && <img src={TICK_ICON} />}
      </div>
  }

  onChangeSkill = textSearch => {
    this.setState({ textSearch })
    if (!textSearch || String(textSearch).trim().length === 0) {
      this.setState({
          suggestionList: []
      })
      return;
    }
    this.searchSuggestion(textSearch);
  };

  searchSuggestion = async (data) => {
    
    let suggestionList = [{ name: data, isDefault: true }]
    const res = await this.props.fetchSkillList({ keyword: data })
    if (!this.state.textSearch) {
      this.setState({
        suggestionList: this.defaultSkillList.sort((a, b) => a.name.localeCompare(b.name))
      })
    } else {
      suggestionList = suggestionList.concat(res.sort((a, b) => a.name.localeCompare(b.name)))
      this.setState({
        suggestionList
      });
    }
    
  }

  onChangeCategory = (data, obj) => {
    const { selectedSkills } = this.state;
    if (!obj.obj || !obj.obj.id || selectedSkills.map(i => i.id).includes(obj.obj.id)) {
      this.setState({
        showTree: false,
        textSearch: ''
      })
      return;
    }

    if (selectedSkills.length === 5) {
      this.setState({
        error: 'error',
        showTree: false,
      }, () => {
        setTimeout(() => {
          this.setState({ error: null })
        }, 3000)
      })
      return
    }
    if (selectedSkills.length < 5) {
      selectedSkills.push(obj.obj)

      const treeData = this.mapTreeData(this.defaultSkillList, selectedSkills);
      this.setState({
          selectedSkills,
          showTree: false,
          treeData
      })
    } else {
      this.setState({
        showTree: false
      })
    }
  };

  remove = data => {
    const { selectedSkills } = this.state;

    const index = selectedSkills.indexOf(data);
    if (index > -1) {
        selectedSkills.splice(index, 1)
        this.setState({
            selectedSkills
        }, () => this.forceUpdate())
    }
  }

  renderSelectedSkillList = () => {
    const { error, selectedSkills } = this.state;
    return (
        <>
            <div className="selected-skill-list">
                {selectedSkills.map(i => {
                    return <Tooltip title="Click to remove" key={i.name}>
                      <span onClick={() => this.remove(i)}>
                        {i.name} <i className="fa fa-times" style={{ fontSize: "20px", marginLeft: "4px" }}/>
                      </span>
                    </Tooltip>
                })}
            </div>
            <div className="selected-skill-list-error">{error && `You have reached the skill limit (5 skills). Please remove an existing skill to add a new skill.`}</div>
        </>
    )
  }

  handleSelect = (data, obj) => {
    const { selectedSkills } = this.state;

    if (obj.data.isDefault) {
      this.handleConfirm()
      return;
    } else {
      if (selectedSkills.map(i => i.id).includes(obj.data.id)) {
        this.setState({
          textSearch: ''
        })
        return;
      }
      if (selectedSkills.length === 5) {
          this.setState({
            error: 'error',
            textSearch: '',
            suggestionList: []
          }, () => {
            setTimeout(() => {
              this.setState({ error: null })
            }, 3000)
          })
      } else {
        selectedSkills.push(obj.data)
        const treeData = this.mapTreeData(this.defaultSkillList, selectedSkills);
        this.setState({
          selectedSkills,
          textSearch: '',
          suggestionList: [],
          treeData
        })
      }
    }
  }

  handleConfirmOk = () => {
    const { selectedSkills, textSearch} = this.state;

    if (selectedSkills.filter(i => !i.id).map(i => i.name).includes(textSearch)) {
      this.setState({
        visibleConfirm: false
      })
      return; 
    }
    if (selectedSkills.length === 5) {
      this.setState({ 
        error: 'error',
        textSearch: '',
        suggestionList: [],
        visibleConfirm: false
      }, () => {
        setTimeout(() => {
          this.setState({ error: null })
        }, 3000)
      })
    } else {
      selectedSkills.push({
        name: textSearch
      })
      this.setState({
        selectedSkills,
        suggestionList: [],
        textSearch: '',
        visibleConfirm: false
      })
    }
  }

  render() {
    const { onModalClose } = this.props;
    const { textSearch, suggestionList, showTree, treeData, visibleConfirm, selectedSkills } = this.state;
    return (
      <ConfirmModal
        modalKey={ModalKey.SKILL_LIST}
        okText="Save"
        title={'Add skill'}
        onOk={this.handleOnOk}
        onCancel={onModalClose}
        disabled={false}
        className="skill-modal"
      >
        <div className="form-group">
          <div className="show-tree-button" onClick={() => this.setState({ showTree: !showTree })}>
            <img src={ARROW_DOWN_ICON} />
          </div>
          <div className="m-search-icon-container">
            <SearchOutlined style={{fontSize: '20px'}}/>
          </div>
          {
            !showTree
            ?
              <AutoComplete
                // open={!!textSearch}
                autoFocus={true}
                defaultActiveFirstOption={true}
                value={textSearch}
                dropdownClassName={'skill-modal-autocomplete'}
                onSelect={this.handleSelect}
                dataSource={suggestionList.map((i) => (
                  <Option key={i.isDefault ? i.name : i.id} value={i.name} data={i}>
                    {this.renderItem(i)}
                  </Option>
                ))}
                onChange={this.onChangeSkill}
                placeholder="Search or select from the list"
              />
            :
              <TreeSelect
                open={true}
                showSearch
                style={{ width: '100%' }}
                dropdownClassName="skill-modal-tree-select"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="Search or select from the list"
                allowClear
                treeDefaultExpandAll={false}
                onSelect={this.onChangeCategory}
                treeData={treeData}
                switcherIcon={<img src={ARROW_DOWN_ICON} />}
              />
          }
          <div>{`You can add a maximum of 5 skills. Select skills that you would confidently be able to offer help with upon request.`}</div>          
          {this.renderSelectedSkillList()}
        </div>
        <Modal
          zIndex={10001}
          className="skill-modal-confirm"
          title="Add Skill"
          visible={visibleConfirm}
          onOk={this.handleConfirmOk}
          onCancel={() => this.setState({ visibleConfirm: false })}
          cancelText="Back"
          okText="Create"
          closeIcon={<i className="fa fa-times" style={{ fontSize: "20px", color: "white" }}/>}
        >
          <p>{`You are creating a new skill that doesn't exist in the skill list. Are you sure you want to create this skill?`}</p>
        </Modal>

      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
  };
};

const mapDispatchToProps = {
  updateProfileSkill,
  fetchSkillList,
  getUserSkills
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SkillModalWrapper);
