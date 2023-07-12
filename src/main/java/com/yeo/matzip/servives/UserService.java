package com.yeo.matzip.servives;

import com.yeo.matzip.entities.*;
import com.yeo.matzip.enums.*;
import com.yeo.matzip.mappers.UserMapper;
import com.yeo.matzip.utils.CryptoUtil;
import com.yeo.matzip.utils.NCloudUtil;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Date;

@Service
public class UserService {
    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine springTemplateEngine;
    private final UserMapper userMapper;

    @Autowired
    public UserService(JavaMailSender javaMailSender, SpringTemplateEngine springTemplateEngine, UserMapper userMapper) {
        this.javaMailSender = javaMailSender;
        this.springTemplateEngine = springTemplateEngine;
        this.userMapper = userMapper;
    }

    public CheckEmailResult checkEmail(String email) { //이메일 중복 열거형 확인법
        return this.userMapper.selectUserByEmail(email) == null
                ? CheckEmailResult.OKAY
                : CheckEmailResult.DUPLICATE;
    }

    public CheckNickNameResult checkNickName(String nickname) { //닉네임 중복 열거형 확인법
        return this.userMapper.selectUserByNickName(nickname) == null
                ? CheckNickNameResult.OKAY
                : CheckNickNameResult.DUPLICATE;
    }

    //    public int getEmailCount(String email){ //이메일 중복여부 인트확인법
//        return this.userMapper.selectUserByEmail(email);
//    }
    public SendRegisterContactCodeResult sendRegisterContactCode(RegisterContactCodeEntity registerContactCode) {
        if (registerContactCode == null ||
                registerContactCode.getContact() == null ||
                !registerContactCode.getContact().matches("^(010)(\\d{8})$")) {
            return SendRegisterContactCodeResult.FAILURE;
        }
        if (this.userMapper.selectUserByContact(registerContactCode.getContact()) != null) {
            return SendRegisterContactCodeResult.FAILURE_DUPLICATE;
        }
        String code = RandomStringUtils.randomNumeric(6);
        String salt = CryptoUtil.hashSha512(String.format("%s%s%f%f",
                registerContactCode.getContact(),
                code,
                Math.random(),
                Math.random()));
        Date createdAt = new Date();
        Date expiresAt = DateUtils.addMinutes(createdAt, 5);
        registerContactCode.setCode(code)
                .setSalt(salt)
                .setCreatedAt(createdAt)
                .setExpiresAt(expiresAt)
                .setExpired(false);
        NCloudUtil.sendSms(registerContactCode.getContact(), String.format("[맛집 회원가입] 인증번호[%s]를 입력해 주세요.", registerContactCode.getCode()));
        return this.userMapper.insertRegisterContactCode(registerContactCode) > 0
                ? SendRegisterContactCodeResult.SUCCESS
                : SendRegisterContactCodeResult.FAILURE;
    }

    public VerifyRegisterContactCodeResult verifyRegisterContactCode(RegisterContactCodeEntity registerContactCode) {

        RegisterContactCodeEntity existingRegisterCodeEntity = this.userMapper.selectRegisterContactCodeByContactCodeSalt(
                registerContactCode.getContact(),
                registerContactCode.getCode(),
                registerContactCode.getSalt()
        );
        if (existingRegisterCodeEntity == null) {
            return VerifyRegisterContactCodeResult.FAILURE;
        }
        Date currentDate = new Date();
        if (currentDate.compareTo(existingRegisterCodeEntity.getExpiresAt()) > 0) {
            return VerifyRegisterContactCodeResult.FAILURE_EXPIRED;
        }
        existingRegisterCodeEntity.setExpired(true); //true 주고 만료시킴
        // 인증했다
        return this.userMapper.updateRegisterContactCode(existingRegisterCodeEntity) > 0
                ? VerifyRegisterContactCodeResult.SUCCESS
                : VerifyRegisterContactCodeResult.FAILURE;

    }


    public RegisterResult register(UserEntity user, RegisterContactCodeEntity registerContactCode) throws MessagingException {
        if (this.userMapper.selectUserByEmail(user.getEmail()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }
        if (this.userMapper.selectUserByContact(user.getContact()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_CONTACT;
        }
        if (this.userMapper.selectUserByNickName(user.getNickname()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }
        registerContactCode = this.userMapper.selectRegisterContactCodeByContactCodeSalt(registerContactCode);
        if (registerContactCode == null || !registerContactCode.isExpired()) {
            return RegisterResult.FAILURE;
        }
        user.setPassword(CryptoUtil.hashSha512(user.getPassword()));

        user.setStatus("EMAIL_PENDING"); //이메일 인증 안된상태 //이메일인증 안할거면 OK
        user.setAdmin(false); //보안에 신경써줘야함 //일반사용자가 자바스크립트로 true를 입력하면 인증없이 회원가입되는걸 막아줌

        RegisterEmailCodeEntity registerEmailCode = new RegisterEmailCodeEntity();
        registerEmailCode.setEmail(user.getEmail());
        registerEmailCode.setCode(RandomStringUtils.randomAlphanumeric(6));
        registerEmailCode.setSalt(CryptoUtil.hashSha512(String.format("%s%s%f%f",
                registerEmailCode.getEmail(),
                registerEmailCode.getCode(),
                Math.random(),
                Math.random())));
        registerEmailCode.setCreateAt(new Date());
        registerEmailCode.setExpiresAt(DateUtils.addHours(registerContactCode.getCreatedAt(), 1));
        registerEmailCode.setExpired(false);

        String url = String.format("http://localhost:6795/user/emailCode?email=%s&code=%s&salt=%s",
                registerEmailCode.getEmail(),
                registerEmailCode.getCode(),
                registerEmailCode.getSalt());
        Context context = new Context();
        context.setVariable("url", url);

        MimeMessage mimeMessage = this.javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        mimeMessageHelper.setSubject("[맛집 회원가입] 이메일 인증");
        mimeMessageHelper.setFrom("yeo328@yu.ac.kr");
        mimeMessageHelper.setTo(user.getEmail());
        mimeMessageHelper.setText(this.springTemplateEngine.process("_registerEmail", context), true);
        this.javaMailSender.send(mimeMessage);


        return this.userMapper.insertUser(user) > 0 && this.userMapper.insertRegisterEmailCode(registerEmailCode) > 0
                ? RegisterResult.SUCCESS
                : RegisterResult.FAILURE;
    }

    public LoginResult login(UserEntity user) {
        if (user.getEmail() == null ||
                user.getPassword() == null ||
                !user.getEmail().matches("^(?=.{10,50}$)([\\da-zA-Z\\-_]{5,25})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$") ||
                !user.getPassword().matches("^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]};:'\",<.>/?]{8,50})$")) {
            return LoginResult.FAILURE;
        }
        UserEntity existingUser = this.userMapper.selectUserByEmail(user.getEmail());
        if (existingUser == null) {
            return LoginResult.FAILURE; // 이메일 혹은 비밀번호가 올바르지 않습니다.
        }
        user.setPassword(CryptoUtil.hashSha512(user.getPassword())); // test1234 -> hashed
        if (!user.getPassword().equals(existingUser.getPassword())) {
            return LoginResult.FAILURE;
        }
        user.setNickname(existingUser.getNickname())
                .setContact(existingUser.getContact())
                .setStatus(existingUser.getStatus())
                .setAdmin(existingUser.isAdmin())
                .setRegisteredAt(existingUser.getRegisteredAt());

        if (user.getStatus().equals("DELETED")) {
            return LoginResult.FAILURE;
        }
        if (user.getStatus().equals("EMAIL_PENDING")) {
            return LoginResult.FAILURE_EMAIL_NOT_VERIFIED; // 이메일 인증 완료되지 않은 계정 == email_pending
        }
        if (user.getStatus().equals("SUSPENDED")) {
            return LoginResult.FAILURE_SUSPENDED;
        }
        return LoginResult.SUCCESS;
    }

    public VerifyRegisterEmailCodeResult verifyRegisterEmailCode(RegisterEmailCodeEntity registerEmailCode) {
        if (registerEmailCode.getEmail() == null ||
                registerEmailCode.getCode() == null ||
                registerEmailCode.getSalt() == null ||
                registerEmailCode.getEmail().matches("^(?=.{10,50}$)([\\da-zA-Z\\-_\\.]{5,25})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$") ||
                !registerEmailCode.getCode().matches("^([\\da-zA-Z]{6})$") ||
                !registerEmailCode.getSalt().matches("^([\\da-f]{128})")) {
            return VerifyRegisterEmailCodeResult.FAILURE;
        }
        registerEmailCode = this.userMapper.selectRegisterEmailCodeByEmailCodeSalt(registerEmailCode);
        if (registerEmailCode == null) {
            return VerifyRegisterEmailCodeResult.FAILURE;
        }
        if (new Date().compareTo(registerEmailCode.getExpiresAt()) > 0) {
            return VerifyRegisterEmailCodeResult.FAILURE_EXPIRED;
        }
        registerEmailCode.setExpired(true);
        this.userMapper.updateRegisterEmailCode(registerEmailCode);

        UserEntity user = this.userMapper.selectUserByEmail(registerEmailCode.getEmail());
        user.setStatus("OKAY");

        return this.userMapper.updateRegisterEmailCode(registerEmailCode) > 0 && this.userMapper.updateUser(user) > 0
                ? VerifyRegisterEmailCodeResult.SUCCESS
                : VerifyRegisterEmailCodeResult.FAILURE;
    }

    public SendRecoverContactCodeResult sendRecoverContactCode(RecoverContactCodeEntity recoverContactCode) {

        if (recoverContactCode == null ||
                recoverContactCode.getContact() == null ||
                !recoverContactCode.getContact().matches("^(010)(\\d{8})$")) {
            return SendRecoverContactCodeResult.FAILURE;
        }
        if (userMapper.selectUserByContact(recoverContactCode.getContact()) == null) {
            return SendRecoverContactCodeResult.FAILURE;
        }
        String code = RandomStringUtils.randomNumeric(6);
        String salt = CryptoUtil.hashSha512(String.format("%s%s%f%f",
                recoverContactCode.getContact(),
                code,
                Math.random(),
                Math.random()));
        Date createdAt = new Date();
        Date expiresAt = DateUtils.addMinutes(createdAt, 5);
        recoverContactCode.setCode(code)
                .setSalt(salt)
                .setCreatedAt(createdAt)
                .setExpiresAt(expiresAt)
                .setExpired(false);
        NCloudUtil.sendSms(recoverContactCode.getContact(), String.format("[맛집 계정복구] 인증번호[%s]를 입력해 주세요.", recoverContactCode.getCode()));

        return this.userMapper.insertRecoverContactCode(recoverContactCode) > 0
                ? SendRecoverContactCodeResult.SUCCESS
                : SendRecoverContactCodeResult.FAILURE;
    }

    public VerifyRecoverContactCodeResult verifyRecoverCotactCode(RecoverContactCodeEntity recoverContactCode) {
        RecoverContactCodeEntity existingRecoverCodeEntity = this.userMapper.selectRecoverContactCodeByContactCodeSalt(
                recoverContactCode.getContact(),
                recoverContactCode.getCode(),
                recoverContactCode.getSalt()
        );
        if (existingRecoverCodeEntity == null) {
            return VerifyRecoverContactCodeResult.FAILURE;
        }
        Date currentDate = new Date();
        if (currentDate.compareTo(existingRecoverCodeEntity.getExpiresAt()) > 0) {
            return VerifyRecoverContactCodeResult.FAILURE_EXPIRED;
        }
        existingRecoverCodeEntity.setExpired(true);
        return this.userMapper.updateRecoverContactCode(existingRecoverCodeEntity) > 0
                ? VerifyRecoverContactCodeResult.SUCCESS
                : VerifyRecoverContactCodeResult.FAILURE;
    }

    public UserEntity getUserByContact(String contact) {
        return this.userMapper.selectUserByContact(contact);
    }

    public SendRecoverEmailCodeResult sendRecoverEmailCode(RecoverEmailCodeEntity recoverEmailCode) throws MessagingException {
        if (recoverEmailCode == null ||
                recoverEmailCode.getEmail() == null ||
                !recoverEmailCode.getEmail().matches("^(?=.{10,50}$)([\\da-zA-Z\\-_\\.]{5,25})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$")) {
            return SendRecoverEmailCodeResult.FAILURE;
        }
        if (this.userMapper.selectUserByEmail(recoverEmailCode.getEmail()) == null) {
            return SendRecoverEmailCodeResult.FAILURE;
        }
        recoverEmailCode
                .setCode(RandomStringUtils.randomAlphanumeric(6))
                .setSalt(CryptoUtil.hashSha512(String.format("%s%s%f%f",
                        recoverEmailCode.getCode(),
                        recoverEmailCode.getEmail(),
                        Math.random(),
                        Math.random())))
                .setCreatedAt(new Date())
                .setExpiresAt(DateUtils.addHours(recoverEmailCode.getCreatedAt(), 1))
                .setExpired(false);
        String url = String.format("http://localhost:6795/user/recoverPassword?email=%s&code=%s&salt=%s",
                recoverEmailCode.getEmail(),
                recoverEmailCode.getCode(),
                recoverEmailCode.getSalt());
        Context context = new Context();
        context.setVariable("url", url);

        MimeMessage mimeMessage = this.javaMailSender.createMimeMessage();
        MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        mimeMessageHelper.setSubject("[맛집 비밀번호 재설정] 이메일 인증");
        mimeMessageHelper.setFrom("inst.yhp@gmail.com"); // 당신 이메일
        mimeMessageHelper.setTo(recoverEmailCode.getEmail());
        mimeMessageHelper.setText(this.springTemplateEngine.process("_recoverEmail", context), true);
        this.javaMailSender.send(mimeMessage);

        return this.userMapper.insertRecoverEmailCode(recoverEmailCode) > 0
                ? SendRecoverEmailCodeResult.SUCCESS
                : SendRecoverEmailCodeResult.FAILURE;
    }

    public VerifyRecoverEmailCodeResult verifyRecoverEmailCode(RecoverEmailCodeEntity recoverEmailCode) {
        if (recoverEmailCode == null ||
                recoverEmailCode.getEmail() == null ||
                recoverEmailCode.getCode() == null ||
                recoverEmailCode.getSalt() == null ||
                !recoverEmailCode.getEmail().matches("^(?=.{10,50}$)([\\da-zA-Z\\-_\\.]{5,25})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$") ||
                !recoverEmailCode.getCode().matches("^([\\da-zA-Z]{6})$") ||
                !recoverEmailCode.getSalt().matches("^([\\da-f]{128})$")) {
            return VerifyRecoverEmailCodeResult.FAILURE;
        }
        recoverEmailCode = this.userMapper.selectRecoverEmailCodeByEmailCodeSalt(recoverEmailCode);
        if (recoverEmailCode == null) {
            return VerifyRecoverEmailCodeResult.FAILURE;
        }
        if (new Date().compareTo(recoverEmailCode.getExpiresAt()) > 0) {
            return VerifyRecoverEmailCodeResult.FAILURE_EXPIRED;
        }
        recoverEmailCode.setExpired(true);
        return this.userMapper.updateRecoverEmailCode(recoverEmailCode) > 0
                ? VerifyRecoverEmailCodeResult.SUCCESS
                : VerifyRecoverEmailCodeResult.FAILURE;
    }

    public RecoverPasswordResult recoverPassword(RecoverEmailCodeEntity recoverEmailCode, UserEntity user) {
        String password = user.getPassword();
        System.out.println(); // 변경한 비밀번호 암호화x
        if (recoverEmailCode == null ||
                recoverEmailCode.getEmail() == null ||
                recoverEmailCode.getCode() == null ||
                recoverEmailCode.getSalt() == null ||
                user == null ||
                user.getPassword() == null) {
            return RecoverPasswordResult.FAILURE;
        }
        recoverEmailCode = this.userMapper.selectRecoverEmailCodeByEmailCodeSalt(recoverEmailCode);
        if (recoverEmailCode == null || !recoverEmailCode.isExpired()) {
            return RecoverPasswordResult.FAILURE;
        }
        user = this.userMapper.selectUserByEmail(user.getEmail());
        if (user == null) {
            return RecoverPasswordResult.FAILURE;
        }
        user.setPassword(CryptoUtil.hashSha512(user.getPassword()));

        user.setPassword(CryptoUtil.hashSha512(password));

        return this.userMapper.updateUser(user) > 0 && this.userMapper.deleteRecoverEmailCode(recoverEmailCode) > 0
                ? RecoverPasswordResult.SUCCESS
                : RecoverPasswordResult.FAILURE;
    }

//    public RegisterEmailCodeResult registerEmailCode(RegisterEmailCodeEntity verifyLogin) {
//        RegisterEmailCodeResult existingRegisterEmailCodeEntity = this.userMapper.selectVerifyRegisterEmailCode(
//                verifyLogin.getEmail(),
//                verifyLogin.getCode(),
//                verifyLogin.getSalt()
//        );
//        if (existingRegisterEmailCodeEntity == null) {
//            return RegisterEmailCodeResult.FAILURE;
//        }
//        Date currentDate = new Date();
//        if (currentDate.compareTo(verifyLogin.getExpiresAt()) > 0) {
//            return RegisterEmailCodeResult.FAILURE_EXPIRED;
//        }
//
//
//        verifyLogin.setExpired(true); //true 주고 만료시킴
//
//        return this.userMapper.updateRegisterContactCode(existingRegisterEmailCodeEntity) > 0
//                ? VerifyRegisterContactCodeResult.SUCCESS
//                : VerifyRegisterContactCodeResult.FAILURE;
//
//
//    }

}

