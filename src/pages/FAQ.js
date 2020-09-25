import React from 'react';
import PageTitle from 'components/PageTitle';

const FAQ = () => (
  <>
    <PageTitle title="Access Troubleshoot" />
    <div className="main-page">
      <div className="container static-content">
        <h2 className="page-name">Access Troubleshoot</h2>
        <h4>How do I get access to the Insight Community Platform?</h4>
        <p>
          {`The Insight Community Platform is a private community of past and present Insight
          alumni. If you're an Insight alum, you should already have received an invitation
          email. Look for an email titled`}
          <em>Welcome to the Insight Community Platform</em>
          {' '}
          from
          <a href="mail-to:community-support@insightdatascience.com"> community-support@insightdatascience.com</a>
          .
        </p>
        <p>
          {`If you are an incoming fellow, you should receive the invitation about a month before
          your session's start date. Your respective program coordinators will reach out and let
          you know when to expect an invitation email.`}
        </p>

        <h4>{`I didn't receive any invitation email`}</h4>
        <p>
          {`If you can't find an email titled`}
          <em>Welcome to the Insight Community Platform</em>
          , try searching for the phrase
          <em>Enter the following temporary credentials to log in to your account</em>
          . If that still does not surface any email from us, reach out to
          <a href="mail-to:community-support@insightdatascience.com"> community-support@insightdatascience.com</a>
          {' '}
          and we will send over a new invitation email shortly.
        </p>

        <h4>{`I have received the invitation email but I'm having issue creating an account`}</h4>
        <p>
          {`Each invitation email contains a temporary password that has an expiration
          date. If you cannot create an account after inputing the password, it's likely
          that it's expired. Reach out to us at`}
          <a href="mail-to:community-support@insightdatascience.com"> community-support@insightdatascience.com</a>
          {' '}
          and we will send over a new invitation email shortly.
        </p>

        <h4>I cannot sign up for an account on the mobile app / Can I complete the onboarding process on mobile?</h4>
        <p>
          You need to complete the onboarding process on the web version before
          you can start using the mobile apps. Once the onboarding process is finished, you
          can log in with our email and new password.
        </p>

        <h4>How do I download the mobile apps?</h4>
        <p>
          You can search the app store for
          <em>Insight Community</em>
          . Here are the direct links
          <ul>
            <li><a href="https://play.google.com/store/apps/details?id=com.insight.messenger">Android </a></li>
            <li><a href="https://apps.apple.com/us/app/insight-community/id1485694671?ls=1">iOS</a></li>
          </ul>
        </p>

        <h4>I selected the wrong session</h4>
        <p>
          Reach out to us at
          <a href="mail-to:community-support@insightdatascience.com" noopener noreferrer> community-support@insightdatascience.com</a>
          {' '}
          with the correct session and we will take care of things on our end.
        </p>

        <h4>Can I change my email?</h4>
        <p>
          {' '}
          Yes. Once you onboard succesfully, you can change your email by going to
          <a href="/settings">Settings</a>
        </p>

        <h4>I need to join team / channel XYZ</h4>
        <p>
          {`You should automatically be added to the right teams / channels upon joining. If
          you have reason to believe that you've been added to the wrong teams, please email
          your corresponding program coordinators.`}
        </p>

        <h4>{`I can't log in to the platform`}</h4>
        <p>
          Clearing the browser cache and cookies for the Platform usually fixes the issue immediately so you can continue working. Please also contact us at
          <a href="mail-to:community-support@insightdatascience.com" target="_blank" rel="noopener noreferrer">community-support@insightdatascience.com</a>
          {' '}
          so we can help resolve the root cause.
        </p>

        <h4>{`I'm on one channel but it's showing another channel's messages`}</h4>
        <p>
          This happens in rare circumstances after you go offline and reconnect after a
          while. We are wokring on a fix but in the meantime, reload your browser
          and the channels will display the correct messages again.
        </p>

        <h4>{`I can't clear the notification badges despite having already read the messages.`}</h4>
        <p>We are working on a fix but please reload your browser and click on the conversations/channels/threads again, the notifications should be cleared.</p>

        <h4>Sometimes my messages are not synced immediately when I have different devices / browsers / tabs open at the same time</h4>
        <p>If you open the same conversation in different devices / browsers / tabs there might be some delay in syncing messages, reloading the chat should solve the issue.</p>

        <h4>When I switch channels, I have to manually scroll down to see the latest messages.</h4>
        <p>
          Our team is aware of the issue and have it our backlog. You can see the status of this in
          <a href="https://insight-community-platform.upvoty.com">public roadmap</a>
          .
        </p>

        <h4>{`I'm facing other issues.`}</h4>
        <p>
          Reach out to us at
          <a href="mail-to:community-support@insightdatascience.com" noopener noreferrer>community-support@insightdatascience.com</a>
          . We normally answer within 24 hours and usually quicker than that.
        </p>
      </div>
    </div>
  </>
);

export default FAQ;
