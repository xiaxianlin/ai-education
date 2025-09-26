from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession
from store.database import Database
from util.encrypt import GetUser
from service.user import UserAuthService
from schema.common import ResponseSchema
from schema.user import UserLogin, UserRegister, Wechat, SendCode

router = APIRouter()


@router.get("/check")
async def check(user=GetUser, db: AsyncSession = Database):
    data = await UserAuthService.check_user(db, user["id"])
    if not data:
        return ResponseSchema(status=401)
    return ResponseSchema(data=data.to_dict({"password"}))


@router.post("/send_sms")
async def send_sms(params: SendCode):
    UserAuthService.send_code(params.phone)
    return ResponseSchema()


@router.post("/register")
async def register(
    pto: UserRegister,
    db: AsyncSession = Database,
):
    await UserAuthService.register(pto.model_dump())
    return ResponseSchema()


@router.post("/login")
async def login(params: UserLogin, db: AsyncSession = Database):
    if params.type == 1:
        token = await UserAuthService.password_login(
            db,
            params.account,
            params.password,
        )
    else:
        token = await UserAuthService.sms_login(
            db,
            params.account,
            params.code,
        )
    return ResponseSchema(data=token)


@router.post("/wx_register")
async def wechat_register(params: Wechat, db: AsyncSession = Database):
    if not params.openid:
        raise "微信未登录，请先登录微信"

    data = await UserAuthService.wechat_register(
        db,
        params.code,
        params.openid,
    )
    return ResponseSchema(data=data)


@router.post("/wx_login")
async def wechat_login(params: Wechat, db: AsyncSession = Database):
    open_id, token = await UserAuthService.wechat_login(db, params.code)
    ok = token is not None
    if not ok:
        token = open_id
    return ResponseSchema(data=token)
