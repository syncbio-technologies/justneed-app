/**
 * Navigation debugging utilities
 * Helps track navigation state and identify issues
 */

export const logNavigationState = (state: any, action?: string) => {
  if (__DEV__) {
    console.log(`[Navigation${action ? ` ${action}` : ''}]`, {
      routeNames: state?.routeNames,
      index: state?.index,
      routes: state?.routes?.map((route: any) => ({
        name: route.name,
        key: route.key,
        params: route.params
      }))
    });
  }
};

export const logAuthState = (user: any, action?: string) => {
  if (__DEV__) {
    console.log(`[Auth${action ? ` ${action}` : ''}]`, {
      isLoggedIn: !!user,
      userId: user?.id,
      email: user?.email
    });
  }
};