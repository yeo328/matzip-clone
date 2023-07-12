package com.yeo.matzip.mappers;

import com.yeo.matzip.entities.*;
import com.yeo.matzip.enums.RegisterEmailCodeResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int insertUser(UserEntity user);
    int insertRecoverEmailCode(RecoverEmailCodeEntity recoverEmailCode);

    int insertRegisterContactCode(RegisterContactCodeEntity registerContactCode);
    int insertRecoverContactCode(RecoverContactCodeEntity recoverContactCode);

    int updateRegisterContactCode(RegisterContactCodeEntity registerContactCodeEntity);
    int updateRecoverContactCode(RecoverContactCodeEntity recoverContactCodeEntity);
    int insertRegisterEmailCode(RegisterEmailCodeEntity registerEmailCode);


    int updateRegisterEmailCode(RegisterEmailCodeEntity registerEmailCode);
    int updateUser(UserEntity user);


    UserEntity selectUserByEmail(@Param(value = "email") String email);

    UserEntity selectUserByNickName(@Param(value = "nickname") String nickname);

    UserEntity selectUserByContact(@Param(value = "contact") String contact);

    RegisterContactCodeEntity selectRegisterContactCodeByContactCodeSalt(@Param(value = "contact") String contact,
                                                                         @Param(value = "code") String code,
                                                                         @Param(value = "salt") String salt);
    RecoverContactCodeEntity selectRecoverContactCodeByContactCodeSalt(@Param(value = "contact") String contact,
                                                                       @Param(value = "code") String code,
                                                                       @Param(value = "salt") String salt);
    RegisterEmailCodeEntity selectRegisterEmailCodeByEmailCodeSalt(RegisterEmailCodeEntity registerEmailCode);


    RegisterContactCodeEntity selectRegisterContactCodeByContactCodeSalt(RegisterContactCodeEntity registerContactCode);

    RecoverEmailCodeEntity selectRecoverEmailCodeByEmailCodeSalt(RecoverEmailCodeEntity recoverEmailCode);
    int updateRecoverEmailCode(RecoverEmailCodeEntity recoverEmailCode);
    int deleteRecoverEmailCode(RecoverEmailCodeEntity recoverEmailCode);

}