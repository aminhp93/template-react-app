import * as Sentry from '@sentry/react';
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { debounce, unionBy } from 'lodash';
import { Avatar, Dropdown, Input, List, Menu, Modal } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';

import { dispatch, RootStateType } from 'store';
import { searchUserInConversation } from 'reducers/users';
import { getUserProgramAbbr } from 'utils/userInfo';

import { CloseModalButton } from './CloseModalButton';
import { ConfirmModal } from './ConfirmModal';

interface IConfirmProps {
  onOk?: any;
  onCancel?: any;
  loading?: boolean;
}

function RemoveMemberConfirm(props: IConfirmProps) {
  return (
    <ConfirmModal
      visible
      title="Remove Member"
      okText="Remove"
      onOk={props.onOk}
      onCancel={props.onCancel}
      destructive
    >
      Are you sure you want to remove this member?
    </ConfirmModal>
  );
}
function RemoveAdminConfirm(props: IConfirmProps) {
  return (
    <ConfirmModal
      visible
      title="Remove Admin"
      okText="Remove Admin"
      onOk={props.onOk}
      onCancel={props.onCancel}
      destructive
    >
      Are you sure you want to remove this person as admin of this channel?
    </ConfirmModal>
  );
}
function MakeAdminConfirm(props: IConfirmProps) {
  return (
    <ConfirmModal
      visible
      title="Assign Channel Admin"
      okText="Make Admin"
      onOk={props.onOk}
      onCancel={props.onCancel}
    >
      Once added, an admin can manage this channel. Do you want to proceed?
    </ConfirmModal>
  );
}
function MemberItem(props) {
  const { member, isMyself, isAdmin, isLastItem } = props;

  const menu = (
    <Menu>
      {isAdmin ? (
        <Menu.Item key="removeAdmin">Remove Admin</Menu.Item>
      ) : (
        <Menu.Item key="makeAdmin">Make Admin</Menu.Item>
      )}
      <Menu.Item key="removeMember">Remove</Menu.Item>
    </Menu>
  );

  const placement = isLastItem ? 'topRight' : 'bottomRight';
  const adminLabelCls = clsx({ 'mr-1': !isAdmin, 'mr-4': isAdmin });

  const userItem = (
    <span className="m-manage_modal__item_name">
      <span className="name">
        {isMyself ? `${member.fullName} (You)` : member.fullName}
      </span>
      {!isMyself && member.sessionShortName && (
        <span className={`session-tag ${getUserProgramAbbr(member)}-accent`}>
          {member.sessionShortName}
        </span>
      )}
    </span>
  );

  return (
    <List.Item className="m-manage_modal__item">
      <List.Item.Meta
        avatar={<Avatar src={member.profileImage} />}
        title={userItem}
        className="m-manage_modal__item_meta"
      />
      {isAdmin && <div className={adminLabelCls}>Channel Admin</div>}
      {isAdmin && !isMyself && (
        <Dropdown overlay={menu} trigger={['click']} placement={placement}>
          <div className="m-dropdown__ellipsis">
            <i className="fa fa-ellipsis-v" />
          </div>
        </Dropdown>
      )}
    </List.Item>
  );
}

/**
 * Member list
 */
interface IMemberListProps {
  members: any[];
  adminIds?: number[];
  authUser?: any;
}

export function MemberList(props) {
  const { members, adminIds, authUser } = props;

  return (
    <List
      dataSource={members}
      renderItem={(item) => <MemberItem key={item.id} member={item} />}
    />
  );
}

/**
 * Channel members modal
 */
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const channelMemberModal = (props) => {
  const [channel, setChannel] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [term, setTerm] = useState(null); // Search term
  const previousTerm = usePrevious(term);
  const debouncedSetTerm = debounce((t) => setTerm(t), 400);

  // Emulate loading channel users once the component is mounted
  useEffect(() => {
    const { conversations, selectedConversationId, users } = props;
    const conversation = conversations[selectedConversationId];
    setChannel(conversation);

    const members = Object.values(users).filter((user) =>
      conversation.members.includes(user.id)
    );

    // If all members of the conversation are already in our store, just take them out
    if (members.length === conversation.members.length) {
      setFilteredUsers(members);
    } else {
      // Otherwise, call the API to fetch users of this conversation
      fetchUsers({ withoutPage: true });
    }
  }, []);

  useEffect(() => {
    setPage(null);
  }, [term]);

  useEffect(() => {
    if (!page && term) {
      fetchUsers({ withoutPage: true });
    }
  }, [page]);

  useEffect(() => {
    if (!hasMore) {
      setPage(null);
    }
  }, [hasMore]);

  const fetchUsers = (options: any = {}) => {
    setLoading(true);

    const params = { term, channel: props.selectedConversationId, page };
    if (params.term) {
      params.term = params.term.trim();
    }

    const { withoutPage } = options;
    if (withoutPage) {
      delete params.page;
    }

    dispatch(searchUserInConversation(params)).then((res) => {
      const { users, nextPage } = res;
      setHasMore(nextPage !== null);

      if (page) {
        setFilteredUsers(unionBy(filteredUsers, Object.values(users), 'id'));
      } else {
        setFilteredUsers(Object.values(users));
      }
      setPage(nextPage);
      setLoading(false);
    });
  };

  return (
    <Modal
      centered
      width={910}
      title={null}
      footer={null}
      visible={true}
      closable={true}
      destroyOnClose={true}
      closeIcon={<CloseModalButton />}
      onCancel={props.onCancel}
      className="m-modal m-manage_modal"
    >
      <h5 className="mb-3 mt-3 m-manage_modal__title">Manage members</h5>
      <p>
        {channel && channel.members.length}{' '}
        {channel && channel.members.length < 2 ? 'member' : 'members'} in{' '}
        {channel && channel.conversationName} channel
      </p>
      <Input
        addonBefore={<i className="fa fa-search" />}
        placeholder="Search"
        className="m-search-input"
        id="memberSearchInput"
        size="large"
        onChange={(e) => debouncedSetTerm(e.target.value)}
      />

      <div className="m-manage_modal__list">
        <InfiniteScroll
          pageStart={1}
          initialLoad={false}
          loadMore={fetchUsers}
          hasMore={hasMore}
          useWindow={false}
        >
          <MemberList members={filteredUsers} />
        </InfiniteScroll>
      </div>

      {action === 'removeMember' && (
        <RemoveMemberConfirm
          loading={loading}
          onCancel={() => setAction(null)}
        />
      )}
      {action === 'removeAdmin' && (
        <RemoveAdminConfirm
          loading={loading}
          onCancel={() => setAction(null)}
        />
      )}
      {action === 'makeAdmin' && (
        <MakeAdminConfirm loading={loading} onCancel={() => setAction(null)} />
      )}
    </Modal>
  );
};

const mapStateToProps = ({
  users,
  authUser,
  conversations,
  selectedConversationId,
}: RootStateType) => ({
  users,
  authUser,
  conversations,
  selectedConversationId,
});

export const ChannelMemberModal = connect(
  mapStateToProps,
  null
)(channelMemberModal);
export default Sentry.withProfiler(MemberList, { name: "MemberList"});
