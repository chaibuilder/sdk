import { useAuth } from "../mutations/useAuth.ts";
import React, { FormEvent, Suspense, useState } from "react";
import { size } from "lodash";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { MdEmail } from "react-icons/md";

export const LoginScreen = ({ logo }: any) => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending } = useAuth();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <section className="h-screen w-screen flex items-center justify-center bg-[radial-gradient(#AAA,transparent_0.5px)] duration-300 [background-size:6px_6px]">
      <div className="overflow-hidden bg-white rounded-xl w-96 drop-shadow-2xl duration-300">
        <div className="p-12">
          <div className="max-w-2xl mx-auto text-center">
            <Suspense>{logo ? React.createElement(logo) : ""}</Suspense>
            <p className="max-w-xl mx-auto text-base leading-relaxed text-gray-700 font-thin">
              Enter your login credential to continue
            </p>
          </div>
          <div className="mt-8">
            <form method="POST" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MdEmail />
                  </div>

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type={"email"}
                    id="email"
                    placeholder="Enter email"
                    className="block w-full py-4 px-10 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
                  />
                </div>
              </div>
              <div>
                <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                      />
                    </svg>
                  </div>

                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={show ? "text" : "password"}
                    id="pwd"
                    placeholder="Enter password"
                    className="block w-full py-4 px-10 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center pl-3 cursor-pointer"
                    onClick={() => setShow(!show)}>
                    {show ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  disabled={isPending || size(email) < 2 || size(password) < 2}
                  type="submit"
                  className="inline-flex disabled:bg-gray-400 items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md focus:outline-none hover:bg-blue-700 focus:bg-blue-700">
                  {isPending ? "Signing in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
          <div className="mt-4 flex items-center justify-end gap-x-2 text-sm">
            <a
              href="https://apps.chaibuilder.com/settings"
              target="_blank"
              className="text-gray-500 hover:text-blue-400">
              Forget your password?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
