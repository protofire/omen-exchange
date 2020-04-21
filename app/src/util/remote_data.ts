import { Ternary } from './types'

enum Types {
  notAsked = '__rd_notAsked__',
  loading = '__rd_loading__',
  success = '__rd_success__',
  failure = '__rd_failure__',
  reloading = '__rd_reloading__',
}

interface Success<Data> {
  readonly _type: Types.success
  readonly data: Data
}
interface Failure {
  readonly _type: Types.failure
  readonly error: Error
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
const isFailure = (rd: RemoteData<any>): rd is Failure => rd._type === Types.failure
const isReloading = (rd: RemoteData<any>): rd is Reloading<any> => rd._type === Types.reloading
const isAsking = (rd: RemoteData<any>): rd is Loading | Reloading<any> => isLoading(rd) || isReloading(rd)

function hasData<T>(rd: RemoteData<T>): rd is Success<T> | Reloading<T> {
  return isSuccess(rd) || isReloading(rd)
}
function getDataOr<T>(rd: RemoteData<T>, defaultValue: T): T {
  return hasData(rd) ? rd.data : defaultValue
}

export type RemoteData<D> = NotAsked | Loading | Reloading<D> | Success<D> | Failure

export const RemoteData = {
  notAsked: (): NotAsked => ({ _type: Types.notAsked }),
  loading: (): Loading => ({ _type: Types.loading }),
  failure: (error: Error): Failure => ({ _type: Types.failure, error }),
  success: <D>(data: D): Success<D> => ({ _type: Types.success, data }),
  reloading: <D>(data: D): Reloading<D> => ({ _type: Types.reloading, data }),
  is: {
    notAsked: isNotAsked,
    loading: isLoading,
    success: isSuccess,
    failure: isFailure,
    reloading: isReloading,
    asking: isAsking,
  },
  hasData,
  getDataOr,
  mapToTernary: <D>(remoteData: RemoteData<D>, f: (data: D) => boolean): Ternary => {
    if (RemoteData.hasData(remoteData)) {
      return f(remoteData.data) ? Ternary.True : Ternary.False
    }

    return Ternary.Unknown
  },
  load: <D>(remoteData: RemoteData<D>): RemoteData<D> => {
    if (RemoteData.hasData(remoteData)) {
      return RemoteData.reloading(remoteData.data)
    }

    return RemoteData.loading()
  },
}
