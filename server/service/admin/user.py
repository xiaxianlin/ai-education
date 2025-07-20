import uuid
from sqlalchemy import asc, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from schema.common import SearchResultSchema
from util import encrypt
from store.database.models import User, UserProfile, UserSubject
from schema.admin import UserCreateSchema, UserUpdateSchema, UserSearchSchema, UserSubjectCreateSchema
from schema import UserSchema


class UserService:

    async def get_by_id(db: AsyncSession, id: str):
        user = await db.scalar(select(User).where(User.id == id))
        if not user:
            raise ValueError("用户不存在")
        
        profile = await db.scalar(select(UserProfile).where(UserProfile.user_id == id))
        subjects = await db.scalars(select(UserSubject).where(UserSubject.user_id == id))
        
        user_data = UserSchema.model_validate(user).model_dump()
        user_data['profile'] = profile.to_dict() if profile else None
        user_data['subjects'] = [subject.to_dict() for subject in subjects.all()]
        
        return user_data

    async def create(db: AsyncSession, params: UserCreateSchema):
        existing_user = await db.scalar(
            select(User).where(User.phone == params.phone),
        )

        if existing_user:
            raise ValueError("手机号已经存在")

        if params.username:
            username_user = await db.scalar(
                select(User).where(User.username == params.username),
            )
            if username_user:
                raise ValueError("用户名已经存在")

        user = User(
            id=str(uuid.uuid4()),
            username=params.username,
            password=encrypt.hash(params.password),
            phone=params.phone,
            status=1
        )
        db.add(user)
        await db.commit()

        return user.id

    async def update(db: AsyncSession, id: str, params: UserUpdateSchema):
        user = await db.scalar(select(User).where(User.id == id))
        if not user:
            raise ValueError("用户不存在")

        if params.phone and params.phone != user.phone:
            existing_user = await db.scalar(
                select(User).where(User.phone == params.phone, User.id != id),
            )
            if existing_user:
                raise ValueError("手机号已经存在")

        if params.username and params.username != user.username:
            username_user = await db.scalar(
                select(User).where(User.username == params.username, User.id != id),
            )
            if username_user:
                raise ValueError("用户名已经存在")

        if params.username is not None:
            user.username = params.username
        if params.password is not None:
            user.password = encrypt.hash(params.password)
        if params.phone is not None:
            user.phone = params.phone
        if params.status is not None:
            user.status = params.status

        await db.commit()

    async def update_status(db: AsyncSession, id: str, status: int):
        user = await db.scalar(select(User).where(User.id == id))
        if not user:
            raise ValueError("用户不存在")

        user.status = status
        await db.commit()

    async def delete(db: AsyncSession, id: str):
        user = await db.scalar(select(User).where(User.id == id))
        if not user:
            raise ValueError("用户不存在")

        await db.delete(user)
        await db.commit()

    async def search(
        db: AsyncSession, params: UserSearchSchema
    ) -> SearchResultSchema[UserSchema]:
        stmt = select(User)
        if params.keywords:
            stmt = stmt.where(
                User.username.like(f"%{params.keywords}%") |
                User.phone.like(f"%{params.keywords}%")
            )
        if params.phone:
            stmt = stmt.where(User.phone.like(f"%{params.phone}%"))
        if params.status is not None:
            stmt = stmt.where(User.status == params.status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await db.scalar(count_stmt)

        sort_column = getattr(User, params.sort, User.create_time)
        stmt = stmt.order_by(
            desc(sort_column) if params.order == "desc" else asc(sort_column),
        )

        offset = (params.current_page - 1) * params.page_size
        stmt = stmt.offset(offset).limit(params.page_size)

        results = await db.scalars(stmt)

        return SearchResultSchema(
            total=total,
            data=[UserSchema.model_validate(user) for user in results.all()],
        )

    async def add_subject(db: AsyncSession, user_id: str, params: UserSubjectCreateSchema):
        user = await db.scalar(select(User).where(User.id == user_id))
        if not user:
            raise ValueError("用户不存在")

        existing_subject = await db.scalar(
            select(UserSubject).where(
                UserSubject.user_id == user_id,
                UserSubject.textbook_version == params.textbook_version,
                UserSubject.subject == params.subject
            )
        )
        if existing_subject:
            raise ValueError("用户已订阅该科目")

        user_subject = UserSubject(
            id=str(uuid.uuid4()),
            user_id=user_id,
            textbook_version=params.textbook_version,
            subject=params.subject
        )
        db.add(user_subject)
        await db.commit()

    async def remove_subject(db: AsyncSession, user_id: str, subject_id: str):
        user_subject = await db.scalar(
            select(UserSubject).where(
                UserSubject.user_id == user_id,
                UserSubject.id == subject_id
            )
        )
        if not user_subject:
            raise ValueError("用户科目订阅不存在")

        await db.delete(user_subject)
        await db.commit()