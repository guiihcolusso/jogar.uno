import type { PlayerData } from '@/shared/socket'

import type { TableSeatPosition } from '../../utils/table-layout.util'

export type PlayerSeatParams = {
  player?: PlayerData
  position: TableSeatPosition
}
