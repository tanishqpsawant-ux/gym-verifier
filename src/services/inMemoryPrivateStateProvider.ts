/**
 * In-memory private state provider, adapted from the reference bboard project.
 * Keeping private state in memory means the athlete's witness data is never
 * persisted by the Midnight stack — the app's own encrypted-at-rest vault is
 * the single owner of that data.
 */
type AnyRecord = Record<string, unknown>;

export const inMemoryPrivateStateProvider = () => {
  const privateStates = new Map<string, Map<string, unknown>>();
  const signingKeys = new Map<string, unknown>();
  let contractAddress: string | null = null;

  const requireAddress = (): string => {
    if (contractAddress === null) {
      throw new Error("Contract address not set. Call setContractAddress() first.");
    }
    return contractAddress;
  };

  const scoped = (address: string): Map<string, unknown> => {
    let states = privateStates.get(address);
    if (!states) {
      states = new Map<string, unknown>();
      privateStates.set(address, states);
    }
    return states;
  };

  const provider = {
    setContractAddress(address: string) {
      contractAddress = address;
    },
    set(key: string, state: unknown) {
      scoped(requireAddress()).set(key, state);
      return Promise.resolve();
    },
    get(key: string) {
      return Promise.resolve(scoped(requireAddress()).get(key) ?? null);
    },
    remove(key: string) {
      scoped(requireAddress()).delete(key);
      return Promise.resolve();
    },
    clear() {
      privateStates.delete(requireAddress());
      return Promise.resolve();
    },
    setSigningKey(address: string, signingKey: unknown) {
      signingKeys.set(address, signingKey);
      return Promise.resolve();
    },
    getSigningKey(address: string) {
      return Promise.resolve(signingKeys.get(address) ?? null);
    },
    removeSigningKey(address: string) {
      signingKeys.delete(address);
      return Promise.resolve();
    },
    clearSigningKeys() {
      signingKeys.clear();
      return Promise.resolve();
    },
  };

  return provider as typeof provider & AnyRecord;
};
