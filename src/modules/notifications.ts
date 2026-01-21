import { Subscription, SubscriptionDetails } from "@dcl/schemas";
import { Env, getEnv } from "@dcl/ui-env";
import { DCLNotification } from "decentraland-ui/dist/components/Notifications/types";
import { BaseClient, BaseClientConfig } from "../lib/BaseClient";

export const NOTIFICATIONS_LIMIT = 50;

export class NotificationsAPI extends BaseClient {
  constructor(config: BaseClientConfig) {
    const url =
      getEnv() === Env.DEVELOPMENT
        ? "https://notifications.decentraland.zone"
        : "https://notifications.decentraland.org";

    super(url, config);
  }

  async getNotifications(limit: number = NOTIFICATIONS_LIMIT, from?: number) {
    const params = new URLSearchParams();

    if (limit) {
      params.append("limit", `${limit}`);
    }

    if (from) {
      params.append("from", `${from}`);
    }

    const { notifications } = await this.fetch<{
      notifications: Array<DCLNotification>;
    }>(
      `/notifications${params.toString().length ? `?${params.toString()}` : ""}`,
      {
        metadata: {
          signer: "dcl:navbar",
          intent: "dcl:navbar:see-notifications",
        },
      },
    );

    return notifications.map(parseNotification);
  }

  async markNotificationsAsRead(ids: string[]) {
    await this.fetch("/notifications/read", {
      method: "PUT",
      body: JSON.stringify({ notificationIds: ids }),
      metadata: {
        notificationIds: ids,
        signer: "dcl:navbar",
        intent: "dcl:navbar:read-notifications",
      },
      headers: { "Content-Type": "application/json" },
    });
  }

  async getSubscription() {
    return this.fetch<
      Subscription & {
        unconfirmedEmail?: string;
      }
    >("/subscription", {
      metadata: {
        signer: "dcl:account",
        intent: "dcl:account:manage-subscription",
      },
    });
  }

  async putSubscription(subscriptionDetails: SubscriptionDetails) {
    return this.fetch<Subscription>("/subscription", {
      method: "PUT",
      body: JSON.stringify(subscriptionDetails),
      headers: { "Content-Type": "application/json" },
      metadata: {
        signer: "dcl:account",
        intent: "dcl:account:manage-subscription",
      },
    });
  }

  async putEmail(email: string) {
    return this.fetch("/set-email", {
      method: "PUT",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
      metadata: {
        signer: "dcl:account",
        intent: "dcl:account:manage-subscription",
      },
    });
  }

  async postEmailConfirmationCode(body: {
    address: string;
    code: string;
    turnstileToken?: string;
    source?: string;
  }) {
    return this.fetch("/confirm-email", {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }
}

const ONBOARDING_KEY = "dcl_notifications_onboarding";

export const checkIsOnboarding = () => {
  if (typeof window !== "undefined") {
    const isOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (isOnboarding) {
      const value = JSON.parse(isOnboarding);
      return value;
    } else {
      localStorage.setItem(ONBOARDING_KEY, "true");
      return true;
    }
  }
};

export const setOnboardingDone = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ONBOARDING_KEY, "false");
  }
};

const parseNotification = (notification: DCLNotification): DCLNotification => {
  return {
    ...notification,
    timestamp: Number(notification.timestamp),
  };
};
