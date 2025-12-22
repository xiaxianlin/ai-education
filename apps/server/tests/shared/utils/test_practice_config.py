import pytest
from shared.utils import practice_config
from shared.core.database import Practice

def test_get_practice_config_default():
    """测试获取默认练习配置"""
    parameters = [
        {"key": "generate_count", "value": [{"1": 10}, {"2": 12}]},
        {"key": "recall_count", "value": [{"1": 5}, {"2": 6}]}
    ]
    practice = Practice(id=1, parameters=parameters)
    
    # 不带年级，默认取第一个
    config = practice_config.get_practice_config(practice)
    assert config["generate_count"] == 10
    assert config["recall_count"] == 5

def test_get_practice_config_grade_specific():
    """测试获取年级特定配置"""
    parameters = [
        {
            "key": "generate_count", 
            "value": [
                {"3": 8},
                {"6": 15}
            ]
        },
        {
            "key": "recall_count",
            "value": [
                {"3": 2},
                {"6": 8}
            ]
        }
    ]
    practice = Practice(id=1, parameters=parameters)
    
    # 测试 3 年级
    config_3 = practice_config.get_practice_config(practice, grade=3)
    assert config_3["generate_count"] == 8
    assert config_3["recall_count"] == 2
    
    # 测试 6 年级
    config_6 = practice_config.get_practice_config(practice, grade=6)
    assert config_6["generate_count"] == 15
    assert config_6["recall_count"] == 8
    
    # 测试未定义的年级（返回起始默认值 15/0）
    config_1 = practice_config.get_practice_config(practice, grade=1)
    assert config_1["generate_count"] == 15
    assert config_1["recall_count"] == 0

def test_get_practice_config_none():
    """测试空配置"""
    practice = Practice(id=1, parameters=None)
    config = practice_config.get_practice_config(practice)
    assert config["generate_count"] == 15
    assert config["recall_count"] == 0

def test_helper_functions():
    """测试便捷函数"""
    parameters = [
        {"key": "generate_count", "value": [{"1": 20}]},
        {"key": "recall_count", "value": [{"1": 10}]}
    ]
    practice = Practice(id=1, parameters=parameters)
    
    assert practice_config.get_generate_count(practice, grade=1) == 20
    assert practice_config.get_recall_count(practice, grade=1) == 10
