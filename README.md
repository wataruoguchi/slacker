# Slacker CLI

The CLI that helps you managing your Slack workspace.

## Motivation

I am managing the slack workspace that everyone can join. The number of members in the workspace increased from 800 ish to over 4000. We wanted to manage the workspace with minimum effort.

## Functionality

Through this CLI, you can do the following manipulation in your workspace.

1. Archive channels that has no activities in last X days.
1. Invite all members in to a specific channel.

## Usage

### 1. Create a Slack App (bot)

Create a Slack App in your Slack admin console.

1. "Settings & Administration" > "Manage apps"
1. Select "Build" on top-right corner.
1. You'd be redirected to `https://api.slack.com/apps/`
1. "Create New App"
1. Set name and stuff.
1. Give the following Bot Token Scopes and install.

```markdown
- channels:history
- channels:join
- channels:manage
- channels:read
```

### 2. Run CLI

For all command execution, you need `SLACK_TOKEN` env value. The token value must start with "xoxb-".

#### Archive dated channels

```shell
SLACK_TOKEN=xoxb-1234567890 slacker exec archiveDatedChannels <dayToArchive> [isDryRun]
```

or

```shell
SLACK_TOKEN=xoxb-1234567890 slacker e a <dayToArchive> [isDryRun]
```

**Example:**

Archive channels that have no activity in last 31 days without dryRun.

```shell
SLACK_TOKEN=xoxb-1234567890 slacker e a 31 0
```

#### Invite all members into a channel

```shell
SLACK_TOKEN=xoxb-1234567890 slacker exec inviteAllMembers <channelsName> [isDryRun]
```

or

```shell
SLACK_TOKEN=xoxb-1234567890 slacker e i <channelsName> [isDryRun]
```

**Example:**

Invite all members to "new-channel" without dryRun.

```shell
SLACK_TOKEN=xoxb-1234567890 slacker e i new-channel 0
```

#### Managing cache

It is not great fetching the list of channels, or the list of users every time. The CLI caches them and store it in a file.

All GET queries' results are stored in cache.

**To view what is cached:**

```shell
SLACK_TOKEN=xoxb-1234567890 slacker exec cache
```

The command above shows the list of key names. Each key has unix date when they are cached.

**To delete particular cache key:**

```shell
SLACK_TOKEN=xoxb-1234567890 slacker exec cache [keyToBust]
```

**Example:**

Bust 'user.list'.

```shell
SLACK_TOKEN=xoxb-1234567890 slacker exec cache user.list
```


# `slacker-core`

The very thin wrapper of `WebClient` from [@slack/web-api](https://www.npmjs.com/package/@slack/web-api).

## What's different

It has a built-in paginate function that returns all request's result as an array.

## Warning

The pagination feature only supports the following requests:

- conversations.list
- conversations.history
- users.list

They are stored in `src/listAttributes.ts`
