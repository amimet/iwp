import { default as ConfigController } from "./ConfigController"
import { default as SectionController } from "./SectionController"
import { default as RolesController } from "./RolesController"
import { default as SessionController } from "./SessionController"
import { default as UserController } from "./UserController"
import { default as WorkorderController } from "./WorkorderController"
import { default as FabricController } from "./FabricController"
import { default as WorkshiftsController } from "./WorkshiftsController"
import { default as FilesController } from "./FilesController"
import { default as TaskController } from "./TaskController"
import { default as PublicController } from "./PublicController"

export default [
    ConfigController,
    PublicController,
    SectionController,
    RolesController,
    SessionController,
    UserController,
    WorkorderController,
    FabricController,
    WorkshiftsController,
    FilesController,
    TaskController,
]