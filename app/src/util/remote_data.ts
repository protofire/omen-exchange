enum Types {
  notAsked = '__rd_notAsked__',
  loading = '__rd_loading__',
  success = '__rd_success__',
  failure = '__rd_failure__',
  reloading = '__rd_reloading',
}

interface Success<Data> {
  readonly _type: Types.success
  readonly data: Data
}
interface Failure<E> {
  readonly _type: Types.failure
  readonly error: E
}
interface NotAsked {
  readonly _type: Types.notAsked
}
interface Loading {
  readonly _type: Types.loading
}
interface Reloading<Data> {
  readonly _type: Types.reloading
  readonly data: Data
}

const isNotAsked = (rd: RemoteData<any>): rd is NotAsked => rd._type === Types.notAsked
const isLoading = (rd: RemoteData<any>): rd is Loading => rd._type === Types.loading
const isSuccess = (rd: RemoteData<any>): rd is Success<any> => rd._type === Types.success
const isFailure = (rd: RemoteData<any>): rd is Failure<any> => rd._type === Types.failure
const isReloading = (rd: RemoteData<any>): rd is Reloading<any> => rd._type === Types.reloading
const isLoaded = (rd: RemoteData<any>): rd is ResolvedData<any> => isSuccess(rd) || isFailure(rd)

function hasData<T>(rd: RemoteData<T>): rd is Success<T> | Reloading<T> {
  return isSuccess(rd) || isReloading(rd)
}

function getDataOr<T>(rd: RemoteData<T>, defaultValue: T): T {
  return isSuccess(rd) ? rd.data : defaultValue
}

export type RemoteData<D> = NotAsked | Loading | Reloading<D> | ResolvedData<D>
// promises/tasks should resolve to ResolvedData
export type ResolvedData<D> = Failure<Error> | Success<D>
export type LoadedData<D> = Success<D> | Reloading<D>

export const RemoteData = {
  notAsked: (): NotAsked => ({ _type: Types.notAsked }),
  loading: (): Loading => ({ _type: Types.loading }),
  failure: <E>(error: E): Failure<E> => ({ _type: Types.failure, error }),
  success: <D>(data: D): Success<D> => ({ _type: Types.success, data }),
  reloading: <D>(data: D): Reloading<D> => ({ _type: Types.reloading, data }),
  is: {
    notAsked: isNotAsked,
    loading: isLoading,
    success: isSuccess,
    failure: isFailure,
    loaded: isLoaded,
    reloading: isReloading,
  },
  hasData,
  getDataOr,
}
