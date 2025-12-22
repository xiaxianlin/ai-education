import pytest
import uuid
from sqlalchemy import select
from admin.services import manager as manager_service
from admin.schema import CreateManangeSchema, ModifyPasswordSchema, UpdateManangeSchema
from shared.core.database import Manager
from shared.utils import encrypt

@pytest.mark.asyncio
async def test_init_super_manager(db_session):
    """测试初始化超级管理员"""
    # 第一次初始化
    await manager_service.init_super_manager()
    
    # 验证是否存在
    result = await db_session.execute(select(Manager).where(Manager.username == "admin"))
    super_admin = result.scalar_one_or_none()
    assert super_admin is not None
    assert super_admin.type == 0
    
    # 第二次初始化不应报错也不应重复创建
    await manager_service.init_super_manager()
    result = await db_session.execute(select(Manager).where(Manager.username == "admin"))
    admins = result.scalars().all()
    assert len(admins) == 1

@pytest.mark.asyncio
async def test_create_and_delete_manager(db_session):
    """测试创建和删除管理员"""
    uid = str(uuid.uuid4())[:8]
    username = f"user_{uid}"
    params = CreateManangeSchema(username=username, type=1)
    
    # 创建
    password = await manager_service.create_manager(db_session, params)
    assert password is not None
    
    # 验证
    result = await db_session.execute(select(Manager).where(Manager.username == username))
    admin = result.scalar_one_or_none()
    assert admin is not None
    
    # 重复创建应报错
    with pytest.raises(ValueError, match="账号已经存在"):
        await manager_service.create_manager(db_session, params)
    
    # 删除
    await manager_service.delete_manager(db_session, admin.id)
    result = await db_session.execute(select(Manager).where(Manager.username == username))
    assert result.scalar_one_or_none() is None

@pytest.mark.asyncio
async def test_update_manager_password(db_session):
    """测试更新密码"""
    uid = str(uuid.uuid4())[:8]
    username = f"pass_{uid}"
    params = CreateManangeSchema(username=username, type=1)
    orig_pass = await manager_service.create_manager(db_session, params)
    
    result = await db_session.execute(select(Manager).where(Manager.username == username))
    admin = result.scalar_one_or_none()
    
    # 更新密码
    new_pass = "NewSecurePass123!"
    modify_params = ModifyPasswordSchema(origin=orig_pass, password=new_pass)
    await manager_service.update_manager_password(db_session, admin.id, modify_params)
    
    # 验证新密码
    await db_session.refresh(admin)
    assert encrypt.verify_password(new_pass, admin.password) is True

@pytest.mark.asyncio
async def test_update_manager_info(db_session):
    """测试更新管理员信息"""
    uid = str(uuid.uuid4())[:8]
    username = f"upd_{uid}"
    params = CreateManangeSchema(username=username, type=1)
    await manager_service.create_manager(db_session, params)
    
    result = await db_session.execute(select(Manager).where(Manager.username == username))
    admin = result.scalar_one_or_none()
    
    # 更新
    update_params = UpdateManangeSchema(type=2, status=0)
    await manager_service.update_manager(db_session, admin.id, update_params)
    
    await db_session.refresh(admin)
    assert admin.type == 2
    assert admin.status == 0
