#include "NanCheck.hpp"
#include "Logger.h"

ArgumentMismatchException::ArgumentMismatchException(const std::string& msg)
    : mMessage(msg)
{
    LOG_TRACE_MESSAGE(mMessage);
}

ArgumentMismatchException::ArgumentMismatchException(int actual, int expected)
    : mMessage("Invalid number of arguments passed to a function")
{
    LOG_TRACE_MESSAGE(mMessage);
}

ArgumentMismatchException::ArgumentMismatchException(int actual, const std::initializer_list<int>& expected)
    : mMessage("Invalid number of arguments passed to a function")
{
    LOG_TRACE_MESSAGE(mMessage);
}

typedef std::function<bool(Nan::NAN_METHOD_ARGS_TYPE) > InitFunction;

class NanMethodArgBinding;
class NanCheckArguments;

NanMethodArgBinding::NanMethodArgBinding(int index, NanCheckArguments& parent)
	: mArgIndex(index)
	, mParent(parent)
{
}

NanMethodArgBinding& NanMethodArgBinding::IsBuffer()
{
	auto bind = [this](Nan::NAN_METHOD_ARGS_TYPE info) 
	{ 
		bool isBuf = node::Buffer::HasInstance(info[mArgIndex]);
		LOG_TRACE_MESSAGE("Checking whether argument is function:" << isBuf);

		if (!isBuf)
			throw ArgumentMismatchException(std::string("Argument ") + lexical_cast(mArgIndex) + " violates IsBuffer check");
		return true;
	};

	mParent.AddAndClause(bind);
	return * this;
}

NanMethodArgBinding& NanMethodArgBinding::IsFunction()
{
	auto bind = [this](Nan::NAN_METHOD_ARGS_TYPE info) 
	{
		bool isFn = info[mArgIndex]->IsFunction();
		LOG_TRACE_MESSAGE("Checking whether argument is function:" << isFn);

		if (!isFn)
			throw ArgumentMismatchException(std::string("Argument ") + lexical_cast(mArgIndex) + " violates IsFunction check");

		return true;
	};
	mParent.AddAndClause(bind);
	return *this;
}

NanMethodArgBinding& NanMethodArgBinding::IsArray()
{
	auto bind = [this](Nan::NAN_METHOD_ARGS_TYPE info) 
	{ 
		bool isArr = info[mArgIndex]->IsArray();
		LOG_TRACE_MESSAGE("Checking whether argument is array:" << isArr);
		if (!isArr)
			throw ArgumentMismatchException(std::string("Argument ") + lexical_cast(mArgIndex) + " violates IsArray check");

		return true;
	};
	mParent.AddAndClause(bind);
	return *this;
}


NanMethodArgBinding& NanMethodArgBinding::IsString()
{
    auto bind = [this](Nan::NAN_METHOD_ARGS_TYPE info)
    {
		bool isStr = info[mArgIndex]->IsString() || info[mArgIndex]->IsStringObject();
		LOG_TRACE_MESSAGE("Checking whether argument is string:" << isStr);

        if (!isStr)
            throw ArgumentMismatchException(std::string("Argument ") + lexical_cast(mArgIndex) + " violates IsString check");

        return true;
    };
    mParent.AddAndClause(bind);
    return *this;
}

NanMethodArgBinding& NanMethodArgBinding::NotNull()
{
	auto bind = [this](Nan::NAN_METHOD_ARGS_TYPE info) 
	{ 
		if (info[mArgIndex]->IsNull())
			throw ArgumentMismatchException(std::string("Argument ") + lexical_cast(mArgIndex) + " violates NotNull check");

		return true;
	};
	mParent.AddAndClause(bind);
	return *this;
}

NanCheckArguments::NanCheckArguments(Nan::NAN_METHOD_ARGS_TYPE info)
: m_info(info)
, m_init([](Nan::NAN_METHOD_ARGS_TYPE info) { return true; })
, m_error(0)
{
}


NanCheckArguments& NanCheckArguments::ArgumentsCount(int count)
{
	return AddAndClause([count](Nan::NAN_METHOD_ARGS_TYPE info) 
	{ 
		if (info.Length() != count)
			throw ArgumentMismatchException(info.Length(), count); 

		return true;
	});
}

NanCheckArguments& NanCheckArguments::ArgumentsCount(int argsCount1, int argsCount2)
{
	return AddAndClause([argsCount1, argsCount2](Nan::NAN_METHOD_ARGS_TYPE info)
	{
		if (info.Length() != argsCount1 || info.Length() != argsCount2)
			throw ArgumentMismatchException(info.Length(), { argsCount1, argsCount2 });

		return true;
	});
}

NanMethodArgBinding NanCheckArguments::Argument(int index)
{
	TRACE_FUNCTION;
	return NanMethodArgBinding(index, *this);
}

NanCheckArguments& NanCheckArguments::Error(std::string * error)
{
	TRACE_FUNCTION;
	m_error = error;
	return *this;
}

/**
 * Unwind all fluent calls
 */
NanCheckArguments::operator bool() const
{
	TRACE_FUNCTION;
	try 
	{
		return m_init(m_info);
	}
	catch (ArgumentMismatchException& exc)
	{
		LOG_TRACE_MESSAGE(exc.what());
		if (m_error)
		{
			*m_error = exc.what();
		}
		return false;
	}
	catch (...)
	{
		LOG_TRACE_MESSAGE("Cought unexpected exception");
		if (m_error)
		{
			*m_error = "Unknown error";
		}
		return false;
	}
}

NanCheckArguments& NanCheckArguments::AddAndClause(InitFunction rightCondition)
{
	InitFunction prevInit = m_init;
	InitFunction newInit = [prevInit, rightCondition](Nan::NAN_METHOD_ARGS_TYPE info) {
		return prevInit(info) && rightCondition(info);
	};
	m_init = newInit;
	return *this;
}


NanCheckArguments NanCheck(Nan::NAN_METHOD_ARGS_TYPE info)
{
	return std::move(NanCheckArguments(info));
}