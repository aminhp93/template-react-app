import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { List, Button, Tooltip } from 'antd';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';

import { getUserSkills } from 'reducers/users';
import SkillModalWrapper from './SkillModalWrapper';
import ConfirmSkillModalWrapper from './ConfirmSkillModalWrapper';

import SHARE_ICON from '@img/share-option-1.svg';
import EDIT_ICON from '@img/edit-2.svg';


interface IProps {
    authUser: any,
    match: any,
    getUserSkills: any,
    history: any,
}

interface IState {
    modal: string,
    data: any,
}

class ProfileSkill extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            modal: null,
            data: []
        }
    }

    componentDidMount() {
        this.fetch()
    }

    fetch = async () => {
        const { match } = this.props;
        const id = get(match.params, 'id');
        const res = await this.props.getUserSkills(id)
        this.setState({ 
            data: res.data
        })
    }

    renderItem = (data) => {
        const { match } = this.props;
        const id = get(match.params, 'id');
        const { name, teamSlug, channelSlug } = data;
        const href = id ? `/messaging/${teamSlug}/${channelSlug}/?user_id=${id}` : `/messaging/${teamSlug}/${channelSlug}/`
        return <div className="flex" style={{ width: '100%' }}>
            <div style={{ width: '100%' }}>
                <div className="flex skill-item-container">
                    <div className="skill-name">{name}</div>
                    { teamSlug && channelSlug && 
                        <Tooltip title="Discuss or ask a question in the relevant community">
                            <div className="get-help-container"><a href={href} target="_blank" rel="noreferrer"><img src={SHARE_ICON}/>Get help?</a></div>
                        </Tooltip>
                    }
                </div>
            </div>
        </div>
    }

    addSkill = () => {
        const { authUser } = this.props;
        const { skill_confirm } = authUser;
        if (skill_confirm) {
            this.setState({ modal: "skillModal"})
        } else {
            this.setState({ modal: "confirmSkillModal" })
        }
    }

    render() {
        const { modal, data } = this.state;
        const { match, authUser } = this.props;
        const id = get(match.params, 'id');
        const allowAdd = !id || authUser.id === id
        return (
            <div className="profile-skill">
                <div className="flex title-container">
                    <div className="title">SKILLS</div>
                    { allowAdd && <div className="add-skill-button" onClick={this.addSkill}><img src={EDIT_ICON} />Add/Edit skill</div>}
                </div>
                {
                    data.length > 0
                    ?   <List
                        size="large"
                        header={null}
                        footer={null}
                        bordered
                        dataSource={data}
                        renderItem={i => <List.Item>{this.renderItem(i)}</List.Item>}
                    />
                    : <div className="no-skill-container">
                        {
                            allowAdd 
                            ? <>
                                <div>{`You don't have any skills to display yet. Select skills that you would confidently be able to offer help with upon request.`}</div>
                                <Button onClick={this.addSkill}>Add a skill</Button>
                            </>
                            : <div>No skill</div>
                        }
                    </div>
                }
                {modal === 'skillModal' && <SkillModalWrapper cb={this.fetch} onModalClose={() => {
                    this.setState({ modal: null })
                }}/>}

                {modal === 'confirmSkillModal' && <ConfirmSkillModalWrapper cb ={() => this.setState({ modal: "skillModal"})} onModalClose={() => {
                    this.setState({ modal: null })
                }} />}  
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
      authUser: get(state, 'authUser') || {},
    };
};

const mapDispatchToProps = {
    getUserSkills
}
  
export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(ProfileSkill)

