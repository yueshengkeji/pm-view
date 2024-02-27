import manager from '@/utils/manager.js'

export function print(frameCoding, frameId) {
    return manager({
        url: `/getPrint/${frameCoding}/${frameId}`,
        method: 'get',
    })
}