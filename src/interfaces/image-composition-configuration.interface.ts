export type IImageCompositionFitMode = 'fill' | 'cover' | 'contain' | 'inside' | 'outside'

export interface IImageCompositionResourceMultiple {
  uses: string
  mode: 0 | 1
}

export type IImageCompositionResourceCompositionDirection = 0 | 1 | 2 | 3

export type IImageCompositionOriginOffset = 'start' | 'center' | 'end' | number | string

export type IImageCompositionPositionOrigin = [IImageCompositionOriginOffset, IImageCompositionOriginOffset]

export type IImageCompositionRuleSet = { [k: 'default' | 'special' | string]: IImageCompositionRule }

export type IImageCompositionElementSet = { [k: string]: IImageCompositionElement }

export interface IImageCompositionSize {
  width?: number | null
  height?: number | null
  fit?: IImageCompositionFitMode | null
}

export type IImageCompositionResourceValueMap = {
  [k: string]: string
}

export interface IImageCompositionResourceValue {
  content: IImageCompositionResourceValueMap
  multiple?: IImageCompositionResourceMultiple | null
}

export interface IImageCompositionResourceComposition {
  direction?: IImageCompositionResourceCompositionDirection | null
  gap?: number | null
}

export interface IImageCompositionResource {
  width?: number | null
  height?: number | null
  fit?: IImageCompositionFitMode | null
  path: string
  framesPath?: string | null
  value?: IImageCompositionResourceValue | null
  composition?: IImageCompositionResourceComposition | null
}

export interface IImageCompositionPositionReference {
  name?: string | null
  origin?: {
    top?: IImageCompositionOriginOffset | null
    right?: IImageCompositionOriginOffset | null
    bottom?: IImageCompositionOriginOffset | null
    left?: IImageCompositionOriginOffset | null
  }
}

export interface IImageCompositionElementPosition {
  top?: number | null
  right?: number | null
  bottom?: number | null
  left?: number | null
  origin?: IImageCompositionPositionOrigin | null
  reference?: IImageCompositionPositionReference | null
}

export interface IImageCompositionElement {
  width?: number | null
  height?: number | null
  fit?: IImageCompositionFitMode | null
  position?: IImageCompositionElementPosition | null
  resource: IImageCompositionResource
  when?: object & ((any) => boolean)
}

export interface IImageCompositionRuleAnimation {
  delay: number
  quality: number
  extractFrames?: number | null
}

export type IImageCompositionRuleLayers = string[]

export interface IImageCompositionRule {
  layers: IImageCompositionRuleLayers
  mainElementName: string
  eventElementName: string
  animation?: IImageCompositionRuleAnimation | null
}

export interface IImageCompositionConfiguration {
  width: number
  height: number
  rules: IImageCompositionRuleSet
  elements: IImageCompositionElementSet
}
