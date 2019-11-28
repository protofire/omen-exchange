enum Types {
  notAsked = '__rd_notAsked__',
  loading = '__rd_loading__',
  success = '__rd_success__',
  failure = '__rd_failure__',
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

const isNotAsked = (rd: RemoteData<any>): rd is NotAsked => rd._type === Types.notAsked
const isLoading = (rd: RemoteData<any>): rd is Loading => rd._type === Types.loading
const isSuccess = (rd: RemoteData<any>): rd is Success<any> => rd._type === Types.success
const isFailure = (rd: RemoteData<any>): rd is Failure<any> => rd._type === Types.failure
const isLoaded = (rd: RemoteData<any>): rd is ResolvedData<any> => isSuccess(rd) || isFailure(rd)

function getDataOr<T>(rd: RemoteData<T>, defaultValue: T): T {
  return isSuccess(rd) ? rd.data : defaultValue
}

export type RemoteData<D> = NotAsked | Loading | ResolvedData<D>
// promises/tasks should resolve to ResolvedData
export type ResolvedData<D> = Failure<Error> | Success<D>

export const RemoteData = {
  notAsked: (): NotAsked => ({ _type: Types.notAsked }),
  loading: (): Loading => ({ _type: Types.loading }),
  failure: <E>(error: E): Failure<E> => ({ _type: Types.failure, error }),
  success: <D>(data: D): Success<D> => ({ _type: Types.success, data }),
  is: {
    notAsked: isNotAsked,
    loading: isLoading,
    success: isSuccess,
    failure: isFailure,
    loaded: isLoaded,
  },
  getDataOr,
}
